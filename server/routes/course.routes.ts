import express from "express";

const CourseRouter = express.Router()
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReview, deleteCourse, editCourse, getAllCourse, getAllCoursesByAdmin, getCourseByUser, getSingleCourse, uploadCourse } from "../controller/course/course.controller"

CourseRouter
  .post('/create-course', isAuthenticated, authorizeRole("admin"), uploadCourse)
  .post('/edit-course/:id', isAuthenticated, authorizeRole("admin"), editCourse)
  .get('/get-course/:id', getSingleCourse)
  .get('/get-courses', getAllCourse)
  .get('/get-course-content/:id', isAuthenticated, getCourseByUser)
  .put("/add_question", isAuthenticated, addQuestion)
  .put("/add_answer", isAuthenticated, addAnswer)
  .put("/add_review/:id", isAuthenticated, addReview)
  .get("/get_courses_admin", isAuthenticated, authorizeRole("admin"), getAllCoursesByAdmin)
  .delete("/delete_course/:id", isAuthenticated, authorizeRole("admin"), deleteCourse)


export default CourseRouter;
