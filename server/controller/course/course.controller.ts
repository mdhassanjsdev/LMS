import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { catchAsyncError } from "../../error/CatchAsyncError";
import cloudinary from 'cloudinary';
import { createCourse, getAllCoursesService } from '../../services/course.service'
import CourseModel from "../../models/course.model";
import { redis } from "../../db/redis";
import mongoose from "mongoose";
import sendMail from "../../utils/sendMail";
import ejs from "ejs";
import path from "path";
import NotificationModel from "../../models/notification.model";



//upload course

export const uploadCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;

        const thumbnail = data.thumbnail;

        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        createCourse(data, res, next)

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


//edit course

export const editCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;

        const thumbnail = data.thumbnail;

        if (thumbnail) {

            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseId,
            {
                $set: data
            },
            {
                new: true
            }
        )

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


//get single course --without purchasing

export const getSingleCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {

            const course = JSON.parse(isCacheExist)

            res.status(201).json({
                success: true,
                course
            })

        } else {
            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggetion -courseData.question -courseData.link");

            await redis.set(courseId, JSON.stringify(course))

            res.status(201).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


//get single course --without purchasing
export const getAllCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const isCacheExist = await redis.get('allCourses');

        if (isCacheExist) {

            const course = JSON.parse(isCacheExist)

            res.status(201).json({
                success: true,
                course
            })

        } else {

            const course = await CourseModel.find().select("-courseData.videoUrl -courseData.suggetion -courseData.question -courseData.link");

            await redis.set('allCourses', JSON.stringify(course))

            res.status(201).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


//get course contant only for valid user

export const getCourseByUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find((course: any) => course._id.toString === courseId);

        if (!courseExist) {
            return next(new ErrorHandler('you are not eligible to access this course', 404));
        }

        const course = await CourseModel.findById(courseId);

        const content = course?.courseData;

        res.status(201).json({
            success: true,
            content
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// add question in course

interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { courseId, question, contentId }: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const courseContent = course?.courseData.find((item: any) =>
            item._id.equals(contentId)
        );

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        //create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        };

        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            userId: req.user?._id,
            title: "New question added",
            message: `You have a new question in ${courseContent.title}`,
        });

        await course?.save();

        res.status(201).json({
            success: true,
            course,
        });


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})


// add answer in course question

interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}


export const addAnswer = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { courseId, answer, questionId, contentId }: IAddAnswerData = req.body;

            const course = await CourseModel.findById(courseId);

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const courseContent = course?.courseData.find((item: any) =>
                item._id.equals(contentId)
            );

            if (!courseContent) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const question = courseContent?.questions?.find((item: any) =>
                item._id.equals(questionId)
            );

            if (!question) {
                return next(new ErrorHandler("Invalid question id", 400));
            }

            //create a new answer object
            const newAnswer: any = {
                user: req.user,
                answer,
            };

            //add these answer to our course content
            question.questionReplies?.push(newAnswer);

            await course?.save();

            if (req.user?._id === question.user?._id) {
                await NotificationModel.create({
                    userId: req.user?._id,
                    title: "New question answer added",
                    message: `You have a new question answer in ${courseContent.title}`,
                });
            } else {
                const data = {
                    name: question.user.name,
                    title: courseContent.title,
                };

                await ejs.renderFile(
                    path.join(__dirname, "../mails/question-reply.ejs"),
                    data
                );

                try {
                    await sendMail({
                        email: question.user.email,
                        subject: "Question reply",
                        template: "question-reply.ejs",
                        data,
                    });
                } catch (error: any) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }
            res.status(201).json({
                success: true,
                course,
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);



//add review course

interface IAddReviewData {
    review: string;
    rating: number;
}

export const addReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const userCoursesList = req.user?.courses;
            const courseId = req.params.id;

            //check the course id is already exist in userCourseList id
            const courseExist = userCoursesList?.some(
                (course: any) => course.courseId.toString() === courseId
            );

            if (!courseExist) {
                return next(
                    new ErrorHandler("Your are not eligible to access these course", 500)
                );
            }

            const course = await CourseModel.findById(courseId);

            const { review, rating } = req.body as IAddReviewData;

            const reviewData: any = {
                user: req.user,
                comment: review,
                rating,
            };


            course?.reviews.push(reviewData);

            let avr = 0;
            course?.reviews.forEach((rev: any) => {
                avr += rev.rating;
            });

            if (course) {
                course.ratings = avr / course.reviews.length;
            }

            await course?.save();


            //create notification
            await NotificationModel.create({
                userId: req.user?._id,
                title: "New review added",
                message: `${req.user?.name} has given a review in ${course?.name}`,
            });

            res.status(201).json({
                success: true,
                course,
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// add reply in review
interface IAddReplyToReview {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyToReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {


            const { comment, courseId, reviewId }: IAddReplyToReview = req.body;

            const course = await CourseModel.findById(courseId);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const review = course?.reviews.find(
                (rev: any) => rev._id.toString() === reviewId
            );
            if (!review) {
                return next(new ErrorHandler("Review not found", 404));
            }

            const replyData: any = {
                user: req.user,
                comment,
            };

            if (!review.commentReplies) {
                review.commentReplies = [];
            }
            review?.commentReplies?.push(replyData);

            await course?.save();

            res.status(201).json({
                success: true,
                course,
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);



// get all courses - (only admin)
export const getAllCoursesByAdmin = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            getAllCoursesService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

//delete course bt admin only
export const deleteCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const course = await CourseModel.findById(id);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }
            await CourseModel.deleteOne({ _id: id });

            await redis.del(id);

            res.status(200).json({
                success: true,
                message: `${course.name} course deleted successfully`,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
