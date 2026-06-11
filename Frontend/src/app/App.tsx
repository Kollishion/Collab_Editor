import { Editor } from '@monaco-editor/react';
import './App.css';
import { MonacoBinding } from 'y-monaco';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import type { editor } from "monaco-editor";

const App = () => {
	const [username, setUsername] = useState(()=>{
		return new URLSearchParams(window.location.search).get("username") || "";
	});
	const [users, setUsers] = useState<any>([]);
	const editorRef = useRef<any>(null);
	const ydoc = useMemo(()=>new Y.Doc(), []);
	const ytext = useMemo(()=>ydoc.getText("monaco"), [ydoc]);

	useEffect(()=>{
		if(username){
			const provider = new SocketIOProvider("/", "monaco", ydoc, {autoConnect: true});
			provider.awareness.setLocalStateField("user", { username });
			const states = Array.from(provider.awareness.getStates().values());
			setUsers(states.filter(state => state.user && state.user.username).map(state => state.user));
			provider.awareness.on("change", () => {
			const states = Array.from(provider.awareness.getStates().values());
			setUsers(states.filter(state => state.user && state.user.username).map(state => state.user));
			})
			function handleBeforeUnload() {
				provider.awareness.setLocalStateField("user", null);
			}
			window.addEventListener("beforeunload", handleBeforeUnload);
			return() => {
				provider.disconnect();
				window.removeEventListener("beforeunload", handleBeforeUnload);
			}
		}
	}, [username]);
	const handleMount = (editorInstance: editor.IStandaloneCodeEditor) => {
		editorRef.current = editorInstance;
			new MonacoBinding(
				ytext,
				editorRef.current.getModel(),
				new Set([editorRef.current]),
			);

	}
		
	const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const username = (form.elements.namedItem("username") as HTMLInputElement).value;
		setUsername(username);
		window.history.pushState({}, "", "?username=" + username);
	}
	if(!username){
		return (
			<main className="w-full bg-gray-950 h-screen flex gap-4 p-4 items-center justify-center">
				<form onSubmit={handleJoin} className="flex gap-4 flex-col">
					<input type='text' placeholder='Enter your username' name="username" className='p-2 rounded-lg bg-gray-800 text-white'/>
					<button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">	
						Join
					</button>
				</form>	
			</main>
		);
	}
  return (
    <>
	<main className='w-full bg-gray-950 h-screen flex gap-4 p-4'>
		<aside className='w-1/4 h-full bg-amber-50 rounded-lg'>
			<h2 className='text-2xl font-bold p-4 border-b border-gray-300'>Users</h2>
			<ul className='p-4'>
				{users.map((users: any, index: number)=>(
					<li key={index} className='p-2 bg-gray-800 text-white rounded mb-2'>{users.username}</li>
				))}
			</ul>
		</aside>
		<section className='w-3/4 h-full bg-neutral-800 rounded-lg overflow-hidden'>
		
		<Editor height="100%" defaultLanguage='javascript' defaultValue='// wadevor' theme='vs-dark' onMount={handleMount}>
				
			</Editor>
		</section>
	</main>	
    </>
  )
}

export default App
