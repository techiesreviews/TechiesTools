export type CaretScrollInput = {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  caretTop: number;
  caretBottom: number;
  caretLeft: number;
  caretRight: number;
  viewportTop: number;
  viewportBottom: number;
  viewportLeft: number;
  viewportRight: number;
};

const clamp = (value: number, maximum: number) => Math.min(Math.max(value, 0), Math.max(maximum, 0));

const nextOffset = (current: number, maximum: number, caretStart: number, caretEnd: number, viewportStart: number, viewportEnd: number) => {
  if (caretStart < viewportStart) return clamp(current + caretStart - viewportStart, maximum);
  if (caretEnd > viewportEnd) return clamp(current + caretEnd - viewportEnd, maximum);
  return current;
};

export const caretScrollPosition = (input: CaretScrollInput) => ({
  scrollTop: nextOffset(input.scrollTop, input.scrollHeight - input.clientHeight, input.caretTop, input.caretBottom, input.viewportTop, input.viewportBottom),
  scrollLeft: nextOffset(input.scrollLeft, input.scrollWidth - input.clientWidth, input.caretLeft, input.caretRight, input.viewportLeft, input.viewportRight),
});
