/**
 * What the deactivate steps hand to each other. Fields are optional because each is filled by
 * the step that learns it; the number in the comment is that step's file number.
 */
export interface DeactivateState {
  /** 010 */
  isHeadOffice?: boolean;
  /** 010 */
  activeUsers?: number;
  /** 010: the status before anything changed; by the after steps the row is already inactive. */
  statusBefore?: string;
  /** Stored status after the main change, re-read by 520. */
  statusAfter?: string;
  /** 010: who is doing it, from `c.user`. */
  deactivatedBy?: string;
  /** 040 */
  recentLogins?: number;
  /** 450: true when the optional statistics query failed and was rolled back to its savepoint. */
  statsSkipped?: boolean;
}
