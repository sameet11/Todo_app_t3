import { useState } from "react";
import { todoinput } from "~/types";
import { api } from "~/utils/api";
import toast from "react-hot-toast"

const CreateTodo=()=>{

    const trpc=api.useContext()
    const {mutate}=api.todo.create.useMutation({

        onMutate:async(newTodo)=>{
            await trpc.todo.all.cancel()

            const previoustodos=trpc.todo.all.getData()

             trpc.todo.all.setData(undefined,(prev)=>{
                const optimisticupdate={
                    id:'ab',
                    text:newTodo,
                    done:false,
                }
                if(!prev) return [optimisticupdate];
                return [...prev,optimisticupdate];
            })

            setNewTodo('')
            return {previoustodos}
        },
        onError:async(err,newTodo,context)=>{
            toast.error('Todo couldnt be created');
            setNewTodo(newTodo);
            trpc.todo.all.setData(undefined,()=>context?.previoustodos)
        },
        onSettled:async()=>{
            await trpc.todo.all.invalidate();
        },
    });
    const [newTodo,setNewTodo]=useState('');

    return (
		<div>
			<form onSubmit={(e) => {
                e.preventDefault();
                const todo=todoinput.safeParse(newTodo)
                if(!todo.success){
                    toast.error(todo.error.format()._errors.join())
                    return 
                }
                mutate(newTodo);

			}} className="flex gap-2">
				<input
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="New Todo..."
					type="text" name="new-todo" id="new-todo"
                    value={newTodo}
                    onChange={(e)=>{setNewTodo(e.target.value)}}
				/>
				<button
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				>Create</button>
			</form>
		</div>
	)
}

export default CreateTodo;