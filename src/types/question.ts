import { User } from './users';
import { Group } from './group';
import { Topic } from './topic';
export type Question = {
    id: number,
    title: string,
    contenet: string,
    user: User,
    type: number,
    topics: Topic[],
    created_at: number,
    updated_at: number,
    is_follow: boolean,
    is_like: boolean,
    answer_count: number,
    comment_count: number,
    follow_count: number,
    like_count: number,
    view_count: number,
    is_group: boolean,
    group: Group
}