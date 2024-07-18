const { User, Course, Profile, Category } = require(`../models/index.js`);
const bcrypt = require(`bcryptjs`);
const { Op, where } = require(`sequelize`);
const { addNickName } = require(`../helpers/helper.js`);

class Controller {
    static async renderHome(req, res) {
        try {
            res.render(`home`);
        } catch (error) {
            res.send(error);
        }
    }

    static async renderPortal(req, res) {
        try {
            res.render(`portal`);
        } catch (error) {
            res.send(error);
        }
    }

    static async renderLogin(req, res) {
        try {
            const { errors } = req.query;
            res.render(`sign-in`, {errors});
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerLogin(req, res) {
        try {
            const { email, password } = req.body;
            const data = await User.findOne({
                where: {
                    email
                }
            });

            if(data) {
                const isValidPassword = bcrypt.compareSync(password, data.password);

                if(isValidPassword) {
                    req.session.UserId = data.id;
                    req.session.role = data.role;
                    res.redirect(`/instructors/dashboard`)
                } else {
                    const errors = `Invalid email or password`;
                    res.redirect(`/portals/signIn?errors=${errors}`)
                }
            } else {
                const errors = `Invalid email or password`;
                res.redirect(`/portals/signIn?errors=${errors}`);
            }
        } catch (error) {
            res.send(error);
        }
    }

    static async renderSignUp(req, res) {
        try {
            const { errors } = req.query;
            res.render(`sign-up`, {errors});
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerSignUp(req, res) {
        try {
            const {username, email, password, role} = req.body;

            console.log(username, email, password, role);

            await User.create({
                username,
                email,
                password,
                role
            })

            res.redirect(`/portals/signIn`);
        } catch (error) {
            if (error.name === `SequelizeValidationError`) {
                const errors = error.errors.map((el) => {
                    return el.message
                });

                res.redirect(`/portals/signUp?errors=${errors}`);
            } else {
                console.log(error);
                res.send(error);
            }
        }
    }

    static async handlerSignOut(req, res) {
        try {
            req.session.destroy((error) => {
                if(error) {
                    res.send(error)
                } else {
                    res.redirect(`/`);
                }
            })
        } catch (error) {
            res.send(error);
        }
    }

    static async renderInstructorDashboard(req, res) {
        try {
            const { message } = req.query
            const userId = req.session.UserId;

            const data = await User.findByPk(userId, {
                include: [
                    {
                        model: Profile,
                    },
                    {
                        model: Course,
                        include: [
                            {
                                model: Category
                            }
                        ]
                    }
                ]
            });

            const categories = await Category.findAll();

            res.render("instructor-dashboard", {data, categories, message});
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    static async renderStudentDashboard(req, res) {
        try {
            const userId = req.session.UserId;
            const { search } = req.query;
            // let option = {};

            // if(search) {
            //     option.where.name = {
            //         [Op.iLike]: `%${search}%`
            //     }
            // }

            // const user = await User.findByPk(userId, {
            //     include: [
            //         {
            //             model: Profile,
            //             where: {
            //                 UserId: {
            //                     [Op.eq]: userId
            //                 }
            //             }
            //         }
            //     ]
            // });

            // const courses = await Course.findAll();

            const {user, courses} = await User.getUserAndCourse(search, userId);

            res.render("student-dashboard", {user, courses, addNickName});
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    static async renderCourseDetail(req, res) {
        try {
            
        } catch (error) {
            res.send(error);
        }
    }

    static async handleGeneratePDFCourse(req, res) {
        try {
            
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerAddCourse(req, res) {
        try {
            const {courseName, courseCategory, courseDescription, courseDuration, courseContent} = req.body;

            await Course.create({
                name: courseName,
                CategoryId: courseCategory,
                description: courseDescription,
                duration: courseDuration,
                content: courseContent
            });

            // console.log(courseName, courseCategory, courseDescription, courseDuration, courseContent);

            res.redirect(`/instructors/dashboard`);
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerEditCourse(req, res) {
        try {
            const { CourseId } = req.params;
            const {courseName, courseCategory, courseDescription, courseDuration, courseContent} = req.body;
            console.log(courseContent);

            await Course.update({
                name: courseName,
                CategoryId: courseCategory,
                description: courseDescription,
                duration: courseDuration,
                content: courseContent
            }, {
                where: {
                    id: CourseId
                }
            });

            res.redirect(`/instructors/dashboard`);
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerDeleteCourse(req, res) {
        try {
            const { CourseId } = req.params;
            const data = await Course.findByPk(CourseId, {
                include: [
                    {
                        include: User
                    }
                ]
            });

            await Course.destroy({
                where: {
                    id: CourseId
                }
            });

            const message = `Course ${data.name} punya ${data.Users[0].name} telah di hapus`;
            res.redirect(`/instructors/dashboard?message=${message}`)
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerLikeCourse(req, res) {
        try {
            
        } catch (error) {
            res.send(error);
        }
    }

    static async handlerEditProfile(req, res) {
        try {
            
        } catch (error) {
            res.send(error);
        }
    }

    // static async renderLogin(req, res) {
    //     try {
            
    //     } catch (error) {
            
    //     }
    // }
    // static async renderLogin(req, res) {
    //     try {
            
    //     } catch (error) {
            
    //     }
    // }
}

module.exports = Controller;