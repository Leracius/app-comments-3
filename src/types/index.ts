export type User = {
  name: string;
  profileImg: string;
};

export type Comment = {
  name: string;
  profileImg: string;
  content: string;
  bodyImg?: string;
};

export type CommentRes = {
  bodyImg: string;
  content: string;
  createdAt: string;
  id: number;
  name: string;
  profileImg: string;
  updatedAt: Date;
};
