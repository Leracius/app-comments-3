export type User = {
  name: string;
  profileImg: string;
};

export type Comment = {
  name: string;
  profileImg: string;
  content: string;
  bodyImg?: string;
  room?: string;
};

export type CommentRes = {
  id: number;
  name: string;
  profileImg: string;
  content: string;
  bodyImg: string;
  room?: string;
  createdAt: string;
  updatedAt: Date;
};

export type ChatRoom = {
  id: string; // e.g. "general", "dm:axel_lucas", "room:equipo"
  name: string;
  isPrivate: boolean;
  avatar?: string;
  recipient?: string;
  passcode?: string;
};

