// Helper for user validation

const validator = require("validator");

const allowedFields = [
    "firstName", "lastName", "emailId", "password", "age", "gender", "photoUrl", "bio", "skills"
];

function validateUserInput(data, isUpdate = false) {
    // Check for unexpected fields
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key) && key !== "userId");
    if (extraFields.length > 0) {
        return { valid: false, message: `Unexpected fields: ${extraFields.join(", ")}` };
    }

    // Required fields for signup
    if (!isUpdate) {
        const required = ["firstName", "emailId", "password", "age", "gender"];
        for (const field of required) {
            if (!data[field]) {
                return { valid: false, message: `Missing required field: ${field}` };
            }
        }
    }

    // Field-specific validations
    if (data.firstName && (!validator.isLength(data.firstName.trim(), { min: 2, max: 50 }))) {
        return { valid: false, message: "First name must be 2-50 characters" };
    }

    if (data.lastName && !validator.isLength(data.lastName.trim(), { max: 50 })) {
        return { valid: false, message: "Last name must be up to 50 characters" };
    }

    if (data.emailId && !validator.isEmail(data.emailId)) {
        return { valid: false, message: "Invalid email format" };
    }

    if (data.password && !validator.isStrongPassword(data.password, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    })) {
        return { valid: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol" };
    }

    if (data.age !== undefined) {
        if (!validator.isInt(String(data.age), { min: 18, max: 120 })) {
            return { valid: false, message: "Age must be between 18 and 120" };
        }
    }

    if (data.gender && !["male", "female", "other"].includes(data.gender)) {
        return { valid: false, message: "Gender must be 'male', 'female', or 'other'" };
    }

    if (data.skills) {
        if (!Array.isArray(data.skills)) {
            return { valid: false, message: "Skills must be an array" };
        }
        if (data.skills.length > 20) {
            return { valid: false, message: "Maximum 20 skills allowed" };
        }
        for (const skill of data.skills) {
            if (typeof skill !== "string" || !validator.isLength(skill, { min: 1, max: 50 })) {
                return { valid: false, message: "Each skill must be a non-empty string up to 50 characters" };
            }
        }
    }

    if (data.bio && !validator.isLength(data.bio, { max: 500 })) {
        return { valid: false, message: "Bio must be up to 500 characters" };
    }

    if (data.photoUrl && !validator.isURL(data.photoUrl)) {
        return { valid: false, message: "Photo URL must be a valid URL" };
    }

    return { valid: true };
}

module.exports = { validateUserInput };