export enum EventState {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SELLING = 'selling',
  SOLD_OUT = 'sold_out',
  ENDED = 'ended',
  ARCHIVED = 'archived',
}

export const VISIBLE_STATES: EventState[] = [
  EventState.PUBLISHED,
  EventState.SELLING,
  EventState.SOLD_OUT,
  EventState.ENDED,
];

export function isPubliclyVisible(state: EventState): boolean {
  return VISIBLE_STATES.includes(state);
}
