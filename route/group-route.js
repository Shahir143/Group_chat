const express = require("express");
const middleware = require("../middleware/auth");
const groupController = require("../controllers/groupController");


const router = express.Router();

router.post("/create-group", middleware.authenticationToken, groupController.createGroup);

router.get(`/getGroups`,middleware.authenticationToken,groupController.getgroups);

router.get("/:group_id/isAdmin", middleware.authenticationToken, groupController.isAdmin);

router.get("/:group_id/contacts", middleware.authenticationToken, groupController.getContacts);

router.post("/:group_id/invite", middleware.authenticationToken, groupController.inviteMember);

router.post("/:group_id/delete", middleware.authenticationToken, groupController.deleteMembers);

router.post("/:group_id/admin", middleware.authenticationToken, groupController.ismakeAdmin);

module.exports = router;