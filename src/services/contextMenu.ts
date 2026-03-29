export enum KVBContextMenuActionId {
  Edit = 'edit',
  Copy = 'copy',
  OpenUrl = 'open_url',
  ShowQr = 'show_qr',
  Custom = 'custom',
}

export type ContextMenuPayload = string | number | boolean | null | undefined;

export interface ContextMenuActionDescriptor<
  TActionId extends string = string,
  TPayload = ContextMenuPayload,
> {
  id: TActionId;
  label: string;
  iconName?: string;
  payload?: TPayload;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ContextMenuSelection<
  TActionId extends string = string,
  TPayload = ContextMenuPayload,
> {
  actionId: TActionId;
  payload?: TPayload;
}
