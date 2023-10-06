import React from "react";
import toast from "react-hot-toast";
import { todo } from "~/types";
import { api } from "~/utils/api";

interface TodoProps{
    Todo:todo;
}

const Todo:React.FC<TodoProps>=({
    Todo,
})=>{

    const {id,text,done}=Todo;
	const trpc=api.useContext();
	const {mutate:deletemutation}=api.todo.delete.useMutation({

		onMutate:async(deleteId)=>{

			await trpc.todo.all.cancel();
			const previoustodos=trpc.todo.all.getData();
			 trpc.todo.all.setData(undefined,(prev)=>{
				if(!prev) return previoustodos
				return prev.filter((todo)=>todo.id!==deleteId);
			 })
			 return {previoustodos};
		},
		onError:async(err,deleteId,context)=>{
			toast.error('todo coudnt be deleted');
			if(!context) return ;
			trpc.todo.all.setData(undefined,()=>context.previoustodos)
		},
		onSettled:async()=>{
			 await trpc.todo.all.invalidate();
		}
	})

	const {mutate:togglemutation}=api.todo.toggle.useMutation({
		onMutate:async({id,done})=>{
			await trpc.todo.all.cancel();

			const previoustodos=trpc.todo.all.getData();
			trpc.todo.all.setData(undefined,(prev)=>{
				if(!prev) return previoustodos;
				prev.map((t)=>{
					if(t.id===id){
						return({
							...t,
							done
						})


					}
					return t;
				})
			})

			return {previoustodos};
		},
		onError: (err, {id,done},context) => {
			toast.error(`An error occured when marking todo as ${done ? "done" : "undone"}`)
			if (!context) return
			trpc.todo.all.setData(undefined, () => context.previoustodos)
		},
		onSuccess:async(todo,{id,done})=>{
			if(done){
			toast.success('Wohoo Task Completed!!!')
			}
		},
		onSettled:async()=>{
			await trpc.todo.all.invalidate();
		}
	})

    return (
		<div
			className="flex gap-2 items-center justify-between"
		>
			<div className="flex gap-2 items-center">
				<input
					className="cursor-pointer w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
					type="checkbox" name="done" checked={done} onChange={(e)=>{
						togglemutation({id,done:e.target.checked})
					}}
				/>
				<label className={`cursor-pointer ${done ? "line-through" : ""}`}>
					{text}
				</label>
			</div>
			<button 
				className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				onClick={()=>{
					deletemutation(id);
				}}
			>Delete</button>
		</div>
	)
}

export default Todo;