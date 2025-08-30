export class DiscordUser {

    static fromApiJson(data: any) {
        return new DiscordUser(
            data.id,
            data.global_name,
            data.username,
            data.avatar,
            data.discriminator
        );
    }

    constructor(
        public readonly id: string,
        public readonly global_name: string,
        public readonly username: string,
        public readonly avatar: string,
        public readonly discriminator: string
    ) {}

    getAvatarImageUrl(): string {
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
    }
}