import { Question } from './question';
import { Page } from './page';
export type QuestionList = {
    questions: Question[],
    page: Page;
}