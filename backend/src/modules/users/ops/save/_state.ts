/** Shared by the steps of `save` (create and update). */
export interface SaveState {
  /** The sign-in identity (control plane) behind a newly created user. */
  platformUserId?: number;
}
