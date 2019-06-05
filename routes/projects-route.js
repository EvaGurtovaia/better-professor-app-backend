const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("../api/secrets.js");
const db = require("../data/dbConfig.js");

// get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await db("projects");
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get a project
router.get("/:id", async (req, res) => {
    try {
        // console.log("GET project")
        const id = req.params.id;
        // console.log("id: ", id)
        const project = await db("projects")
            .where({ id })
            .first();
        // console.log("project: ", project)
        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ message: "Error trying to GET project!" });
    }
});

// Get a list of students associated with the project and the professor
router.get("/:id/students", async (req, res) => {
    const professor_id = req.decodedJwt.subject;
    const project_id = req.params.id;

    try {
        const result = await db("student_project")
            .join("students", "students.id", "=", "student_project.student_id")
            .where({ project_id, professor_id })
            .select("student_id", "firstname", "lastname", "email")
            .distinct("student_id");

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error trying to GET students!" });
    }
});

// Get student messsages in a particular project
router.get("/:id/messages", async (req, res) => {
    try {
        const professor_id = req.decodedJwt.subject;
        const project_id = req.params.id;

        const result = await db("messages")
            .join(
                "student_project",
                "messages.id",
                "=",
                "student_project.student_message"
            )
            .where({ project_id, professor_id })
            .select();

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            message: "Error trying to GET messages for student's project!"
        });
    }
});

router.post("/:id/messages", async (req, res) => {
    try {
        const professor_id = req.decodedJwt.subject;
        const project_id = req.params.id;

        let { message, send_date, to } = req.body;
        if (!message || !send_date || !to || !to.length) {
            res.status(400).json({
                message: "please fill in all fields",
                message,
                send_date,
                to
            });
        } else {
            const id = await db("messages")
                .insert({ message, send_date })
                .returning("id");

            console.log({ message, id });
            const inserts = to.map(student_id =>
                db("student_project").insert({
                    student_id,
                    project_id,
                    professor_id,
                    student_message: id[0]
                })
            );

            await Promise.all(inserts);
            res.status(201).json({ message: `Message has been created`, id });
        }
    } catch (err) {
        res.status(500).json({
            message: "Error trying to POST a new message for student's project!"
        });
    }
});

// create new project
router.post("/", async (req, res) => {
    console.log("create a new project", req.body);
    const {
        projectName: project_name,
        projectDeadline: project_deadline,
        feedbackDeadline: feedback_deadline,
        recommendationDeadline: recommendation_deadline
    } = req.body;
    try {
        let project = req.body;
        if (
            !project_name ||
            !project_deadline ||
            !feedback_deadline ||
            !recommendation_deadline
        ) {
            res.status(400).json({
                message: "please fill in all fields2",
                project_name,
                project_deadline,
                feedback_deadline,
                recommendation_deadline
            });
        } else {
            const id = await db("projects")
                .insert({
                    project_name,
                    project_deadline,
                    feedback_deadline,
                    recommendation_deadline
                })
                .returning("id");
            res.status(201).json({
                message: `${project_name} has been created`,
                id: id[0]
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// destroy projects
router.delete("/:id", async (req, res) => {
    try {
        console.log("delete Route");
        const id = req.params.id;
        console.log("id: ", id);
        const numDeleted = await db("projects")
            .where({ id })
            .del();
        console.log("numDeleted: ", numDeleted);
        if (numDeleted != 0) {
            console.log("if: true");
            res.status(201).json({ message: "Project Deleted" });
        } else {
            console.log("if: false");
            res.status(404).json({ message: "No record found!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// update project
router.put("/:id", async (req, res) => {
    const {
        projectName: project_name,
        projectDeadline: project_deadline,
        feedbackDeadline: feedback_deadline,
        recommendationDeadline: recommendation_deadline
    } = req.body;
    try {
        console.log("put");
        const id = req.params.id;
        console.log("id: ", id);
        const numUpdated = await db("projects")
            .where({ id })
            .update({
                project_name,
                project_deadline,
                feedback_deadline,
                recommendation_deadline
            });
        console.log("numUpdated: ", numUpdated);
        if (numUpdated != 0) {
            console.log("status 201");
            res.status(201).json({ message: `You changed the project's info` });
        } else {
            res.status(404).json({ message: "No record found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
