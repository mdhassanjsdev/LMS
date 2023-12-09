import userModel from "../models/user.model"

export const getUserById = async (id: string, res: any) => {

    const user = await userModel.findById(id)

    if (user) {

        res.status(200).json({
            success: true,
            user
        })
    }
}


export const getAllUsersService = async (res: any) => {
    const users = await userModel.find().sort({ createdAt: -1 })

    res.status(200).json({
        status: 200,
        users,
        msg: 'ok'
    })
}



export const updateUserRoleService = async (res: any, id: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true })

    res.status(200).json({
        status: 200,
        user,
        msg: 'ok'
    })

}