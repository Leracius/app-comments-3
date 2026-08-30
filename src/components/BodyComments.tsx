import { useEffect, useRef } from "react";
import CardComment from "./CardComment";
import { CommentStore } from "../store/preferences";

export default function BodyComments() {
  const { comments } = CommentStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
      {comments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 h-full">
          <span>💬 No hay mensajes aún.</span>
          <span className="text-xs text-slate-600">¡Sé el primero en escribir algo!</span>
        </div>
      ) : (
        comments.map((el) => <CardComment key={el.id} data={el} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}

