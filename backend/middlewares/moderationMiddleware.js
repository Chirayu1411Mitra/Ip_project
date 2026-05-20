import User from "../db/schemas/User.js";

export const checkBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select(
      "bannedUntil banReason",
    );

    if (user && user.bannedUntil && user.bannedUntil > new Date()) {
      const daysRemaining = Math.ceil(
        (user.bannedUntil - new Date()) / (1000 * 60 * 60 * 24),
      );
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
      const textParts = fieldsToCheck
        .map((field) => req.body[field])
        .filter((text) => text);
      const text = textParts.join(" ");

      if (!text || text.trim().length === 0) {
        return next();
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: `You are a content moderation system for a student academic platform.
Analyze the text and check for: hate speech/racial slurs, harassment/personal abuse, inappropriate sexual content, threats of violence.
Respond ONLY with valid JSON: {"violated": true/false, "reason": "brief reason or empty string"}
Be strict but fair. Academic frustration and criticism of ideas are allowed. Only flag clear serious violations.`,
          messages: [
            {
              role: "user",
              content: `Check this content: "${text}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("Moderation API error:", response.status);
        return next();
      }

      const data = await response.json();
      const textContent = data.content[0]?.text;

      if (!textContent) {
        return next();
      }

      const moderation = JSON.parse(textContent);

      if (moderation.violated === true) {
        const user = await User.findByIdAndUpdate(
          req.userId,
          {
            bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            banReason: moderation.reason,
          },
          { new: true },
        );

        return res.status(403).json({
          message:
            "Your message violated our community policy. Your account has been suspended for 30 days.",
          banReason: moderation.reason,
          bannedUntil: user.bannedUntil,
          banned: true,
        });
      }

      next();
    } catch (err) {
      console.error("moderateContent error:", err);
      next();
    }
  };
};
