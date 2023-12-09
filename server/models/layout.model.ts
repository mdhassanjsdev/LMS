import mongoose, { Document, Model, Schema, model } from "mongoose";


interface FaqItem extends Document {
    question: string;
    answer: string;
}

interface Category extends Document {
    title: string;
}

interface BannerImage extends Document {
    bannerImage: string
}

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Category[];
    banner: {
        image: string;
        title: string;
        subtitle: string;
        show: boolean
    }

}


const faqSchema = new Schema<FaqItem>({
    question: { type: String },
    answer: { type: String }
})


const categorySchema = new Schema<Category>({
    title: { type: String }
})


const layoutSchema = new Schema<Layout>({

    type: { type: String },

    faq: [faqSchema],

    categories: [categorySchema],

    banner: {
        image: { type: String },
        title: { type: String },
        subtitle: { type: String },
        show: { type: String }
    }

})


const LayoutModel = model<Layout>('Layout', layoutSchema);

export default LayoutModel



