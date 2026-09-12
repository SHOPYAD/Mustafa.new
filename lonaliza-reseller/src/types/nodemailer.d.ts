declare module "nodemailer" {
  type Address = { name?: string; address: string };
  type Attachment = {
    filename?: string;
    content?: Buffer | string;
    contentType?: string;
    cid?: string;
    contentDisposition?: "inline" | "attachment";
  };
  type TransportOptions = {
    host?: string;
    port?: number;
    secure?: boolean;
    requireTLS?: boolean;
    name?: string;
    auth?: { user: string; pass: string };
    tls?: { minVersion?: string; rejectUnauthorized?: boolean };
  };
  type SendMailOptions = {
    from?: string | Address;
    to?: string | Address;
    replyTo?: string | Address;
    subject?: string;
    html?: string;
    text?: string;
    date?: Date;
    messageId?: string;
    envelope?: { from?: string; to?: string | string[] };
    headers?: Record<string, string>;
    attachments?: Attachment[];
  };
  type Transporter = {
    sendMail: (opts: SendMailOptions) => Promise<unknown>;
    verify: () => Promise<boolean>;
  };
  function createTransport(opts: TransportOptions): Transporter;
  export default { createTransport };
  export { createTransport };
}
