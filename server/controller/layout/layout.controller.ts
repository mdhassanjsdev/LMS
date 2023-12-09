import { NextFunction, Request, Response } from "express"
import { catchAsyncError } from "../../error/CatchAsyncError"
import LayoutModel from "../../models/layout.model"
import { ErrorHandler } from "../../utils/ErrorHandler"


export const createLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        const eachTypeExist = await LayoutModel.findOne({ type })

        if (eachTypeExist) {
            return next(new ErrorHandler(`${type}  already exist`, 400))
        }

        if (type === 'Banner') {
            const { title, subtitle } = req.body

            const bannerImage = ''

            await LayoutModel.create({ type: 'Banner', banner: { image: bannerImage, title, subtitle } })
        }

        if (type === 'FAQ') {

            const { faq } = req.body

            const FaqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )

            await LayoutModel.create({ type: 'FAQ', faq: FaqItems })
        }

        if (type === 'Categories') {
            const { categories } = req.body

            const CategoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )

            await LayoutModel.create({ type: 'Categories', categories: CategoriesItems })
        }

        res.status(201).json({
            status: 201,
            msg: 'Layout created successfully'
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
});


export const editlayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { type } = req.body;


        if (type === 'Banner') {

            const bannerData = await LayoutModel.findOne({ type: 'Banner' })

            if (req?.file?.fieldname === 'bannerImage') {

                // if (bannerData?.banner?.image) {
                //     await removeFromCLoud(bannerData.banner.image)
                // }

                const bannerImage = ''

                await LayoutModel.findByIdAndUpdate(bannerData._id, { banner: { image: bannerImage, ...req.body } })

            } else {

                await LayoutModel.findByIdAndUpdate(bannerData._id, { banner: { image: bannerData.banner.image, ...req.body } })
            }

        }

        if (type === 'FAQ') {

            const { faq } = req.body

            const faqData = await LayoutModel.findOne({ type: 'FAQ' })

            const FaqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )

            await LayoutModel.findByIdAndUpdate(faqData._id, { faq: FaqItems })
        }

        if (type === 'Categories') {
            const { categories } = req.body

            const categoriesData = await LayoutModel.findOne({ type: 'Categories' })

            const CategoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )

            await LayoutModel.findByIdAndUpdate(categoriesData._id, { categories: CategoriesItems })
        }

        res.status(201).json({
            status: 201,
            msg: 'Layout updated successfully'
        })

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
});


export const getLayoutByType = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params
        const layout = await LayoutModel.findOne({ type })

        res.status(200).json({
            status: 200,
            layout,
            msg: 'ok'
        })

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
})
