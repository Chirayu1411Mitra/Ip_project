// backend/middlewares/moderationMiddleware.js
import User from "../db/schemas/User.js";
import { BedrockRuntimeClient, ApplyGuardrailCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export const checkBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("bannedUntil banReason");
    if (user && user.bannedUntil && user.bannedUntil > new Date()) {
      const daysRemaining = Math.ceil((user.bannedUntil - new Date()) / (1000 * 60 * 60 * 24));
      return res.status(403).json({
        message: `Your account is suspended for ${daysRemaining} more days`,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
        banned: true,
      });
    }
    next();
  } catch (err) {
    console.error("checkBanStatus error:", err);
    next();
  }
};

export const moderateContent = (fieldsToCheck) => {
  return async (req, res, next) => {
    try {
      const textParts = fieldsToCheck.map((field) => req.body[field]).filter((text) => text);
      const text = textParts.join(" ");

      if (!text || text.trim().length === 0) return next();

      console.log("🔍 Checking with AWS Bedrock Guardrails...");

      const command = new ApplyGuardrailCommand({
        guardrailIdentifier: process.env.AWS_GUARDRAIL_ID,
        guardrailVersion: process.env.AWS_GUARDRAIL_VERSION || "DRAFT",
        source: "INPUT",
        content: [
          {
            text: {
              text: text,
            },
          },
        ],
      });

      const response = await bedrockClient.send(command);

      if (response.action === "GUARDRAIL_INTERVENED") {
        console.log("🚫 FLAGGED BY GUARDRAIL");
        const reason = "Violated community policy (Flagged by AWS Guardrail)";
        const user = await User.findByIdAndUpdate(
          req.userId,
          { bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), banReason: reason },
          { new: true },
        );
        return res.status(403).json({
          message: "Your message violated our community policy. Your account has been suspended for 30 days.",
          banReason: reason,
          bannedUntil: user.bannedUntil,
          banned: true,
        });
      }

      console.log("✨ Passed");
      next();
    } catch (err) {
      console.error("moderateContent error:", err);
      next(); // fail open
    }
  };
};