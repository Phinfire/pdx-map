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
        if (this.avatar.length == 0) {
            return `https://cdn.discordapp.com/embed/avatars/0.png`;
        }
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
    }
    
    getName() {
        return this.global_name && this.global_name.length > 0 ? this.global_name : `${this.username}`;
    }
}