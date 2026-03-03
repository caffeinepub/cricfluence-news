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
    publishedDate: string;
    author: string;
    summary: string;
    imageUrl: string;
    category: string;
}
export interface backendInterface {
    createArticle(title: string, category: string, summary: string, content: string, author: string, publishedDate: string, imageUrl: string): Promise<bigint>;
    deleteArticle(id: bigint): Promise<void>;
    getAllArticles(): Promise<Array<Article>>;
    getArticleById(id: bigint): Promise<Article>;
    getArticlesByCategory(category: string): Promise<Array<Article>>;
    seedSampleData(): Promise<void>;
    updateArticle(id: bigint, title: string, category: string, summary: string, content: string, author: string, publishedDate: string, imageUrl: string): Promise<void>;
}
