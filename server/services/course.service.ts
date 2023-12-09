import { catchAsyncError } from "../error/CatchAsyncError";
import CourseModel from "../models/course.model";

export const createCourse = catchAsyncError(async (data: string, res: any) => {
    const course = CourseModel.create(data)

    res.status(201).json({
        success: true,
        course
    })

})

//get courses
export const getAllCoursesService = async (res: any) => {
    const courses = await CourseModel.find().sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      courses,
    });
  };
  