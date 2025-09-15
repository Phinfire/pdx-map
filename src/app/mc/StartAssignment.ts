import { DiscordUser } from '../../model/social/DiscordUser';
export interface StartAssignment {
    user: DiscordUser;
    region_key: string;
    start_key: string | null;
    start_data: object | null;
}