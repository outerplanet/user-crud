import { Transform } from 'class-transformer';

export const ToLowerCase = () => Transform(({ value }) => value?.toLowerCase());

export const Trim = () => Transform(({ value }) => value?.trim());
