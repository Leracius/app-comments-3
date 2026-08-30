import CommentInput from "./components/CommentInput";
import UserInput from "./components/UserInput";
import { CommentStore } from "./store/preferences";

export default function App() {
  const { user } = CommentStore();
  const isAuthenticated = Boolean(user?.name && user?.profileImg);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-0 sm:p-4 text-slate-100">
      <main className="w-full max-w-lg h-screen sm:h-[90vh] bg-slate-950 flex flex-col overflow-hidden sm:rounded-2xl sm:border sm:border-slate-800 shadow-2xl">
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <UserInput />
          </div>
        ) : (
          <CommentInput />
        )}
      </main>
    </div>
  );
}

