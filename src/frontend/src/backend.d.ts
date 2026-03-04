import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Article {
    id: bigint;
    title: string;
    content: string;
    views: bigint;
    publishedDate: string;
    author: string;
    likes: bigint;
    summary: string;
    imageUrl: string;
    category: Category;
}
export interface Comment {
    id: bigint;
    createdAt: string;
    text: string;
    author: string;
    articleId: bigint;
    isPinned: boolean;
}
export interface Sponsor {
    id: bigint;
    title: string;
    linkUrl: string;
    createdAt: string;
    isActive: boolean;
    imageUrl: string;
    position: Position;
}
export enum Category {
    incidents = "incidents",
    internationalNews = "internationalNews",
    cricket = "cricket",
    nationalNews = "nationalNews",
    influencers = "influencers",
    sports = "sports"
}
export enum Position {
    mid = "mid",
    top = "top",
    bottom = "bottom"
}
export interface backendInterface {
    createArticle(title: string, content: string, publishedDate: string, author: string, summary: string, imageUrl: string, category: Category): Promise<bigint>;
    createComment(articleId: bigint, author: string, text: string, createdAt: string): Promise<bigint>;
    createSponsor(title: string, imageUrl: string, linkUrl: string, position: Position, createdAt: string): Promise<bigint>;
    deleteArticle(id: bigint): Promise<void>;
    deleteComment(id: bigint): Promise<void>;
    deleteSponsor(id: bigint): Promise<void>;
    getActiveSponsorsByPosition(position: Position): Promise<Array<Sponsor>>;
    getAllArticles(): Promise<Array<Article>>;
    getAllComments(): Promise<Array<Comment>>;
    getAllSponsors(): Promise<Array<Sponsor>>;
    getArticleById(id: bigint): Promise<Article>;
    getArticlesByCategory(category: Category): Promise<Array<Article>>;
    getCommentsByArticle(articleId: bigint): Promise<Array<Comment>>;
    getSponsorById(id: bigint): Promise<Sponsor>;
    likeArticle(id: bigint): Promise<void>;
    recordView(id: bigint): Promise<void>;
    seedSampleData(): Promise<void>;
    togglePinComment(id: bigint): Promise<void>;
    toggleSponsorActive(id: bigint): Promise<void>;
    updateArticle(id: bigint, title: string, content: string, publishedDate: string, author: string, summary: string, imageUrl: string, category: Category): Promise<void>;
    updateSponsor(id: bigint, title: string, imageUrl: string, linkUrl: string, position: Position): Promise<void>;
}
