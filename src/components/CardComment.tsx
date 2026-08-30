import { CommentRes } from "../types";
import { CommentStore } from "../store/preferences";

type BodyCommentProps = {
  data: CommentRes;
};

export default function CardComment({ data }: BodyCommentProps) {
  const { user } = CommentStore();
  const isMe = data.name === user.name;

  return (
    <div className={`flex gap-2.5 items-start ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <img
        className="h-9 w-9 object-cover rounded-full border border-slate-700 shrink-0"
        src={data.profileImg || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name}`}
        alt={data.name}
      />
      <div
        className={`p-3 rounded-2xl space-y-1.5 border max-w-[80%] text-sm ${
          isMe
            ? "bg-indigo-950/70 border-indigo-700/50 rounded-tr-none text-indigo-100"
            : "bg-slate-950 border-slate-800 rounded-tl-none text-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <p className={`font-semibold ${isMe ? "text-indigo-300" : "text-indigo-400"}`}>
            @{data.name} {isMe && "(Tú)"}
          </p>
          {data.createdAt && (
            <span className="text-[10px] text-slate-500">
              {new Date(data.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {data.bodyImg && data.bodyImg.trim() !== "" && (
          <img
            className="rounded-lg max-h-64 w-auto object-cover border border-slate-800/80 my-1"
            src={data.bodyImg}
            alt="imagen enviada"
          />
        )}

        {data.content && (
          <p className="text-slate-300 text-sm whitespace-pre-wrap break-words leading-relaxed">
            {data.content}
          </p>
        )}
      </div>
    </div>
  );
}

