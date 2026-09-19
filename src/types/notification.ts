export type Notification={id:number;pedido_id:number|null;tipo:string;titulo:string;mensaje:string;enlace_url:string|null;leida:boolean;creada_en:string}
export type NotificationList={items:Notification[];no_leidas:number}
export type NotificationCampaign={tipo:'nuevo_producto'|'oferta'|'reposicion'|'informacion';titulo:string;mensaje:string;destinatarios:'todos'|'seleccionados';usuario_ids:number[];enviar_email:boolean}
export type NotificationCampaignResult={notificaciones_creadas:number;emails_programados:number}
