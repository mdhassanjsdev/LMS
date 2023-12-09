import { Request } from "express";
import { IUser } from "../models/user.model";


declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}


export interface IRegisterationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}


export interface IActivationToken {
    token: string,
    activationCode: string;
}


export interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}


export interface IActivationRequest {
    activation_Token: string;
    activation_Code: string;
}


export interface IUpdateUserInfo {
    name?: string;
    email?: string;
}

export interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export interface IUpdateProfilePicture {
    avatar: string
}

export interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export interface IAddReviewData {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}

export interface IAddReplyReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}