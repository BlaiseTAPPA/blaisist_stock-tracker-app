/** The signed-in user, as exposed to the app (a subset of the Better Auth user). */
export type User = {
  id: string;
  name: string;
  email: string;
};
