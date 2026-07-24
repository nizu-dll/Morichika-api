import "dotenv/config";
import express from "express";
import cors from "cors";
import {
    Client,
    GatewayIntentBits
} from "discord.js";

const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const PORT =
    process.env.PORT || 3000;

const GUILD_ID =
    process.env.GUILD_ID;


/* =========================
   DISCORD BOT READY
========================= */

client.once("ready", () => {

    console.log(
        `Bot logged in as ${client.user.tag}`
    );

    console.log(
        `Connected to ${client.guilds.cache.size} server(s)`
    );

});


/* =========================
   API STATUS
========================= */

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            name: "Morichika Stats API",
            status: "online"
        });

    }
);


/* =========================
   SERVER STATS API
========================= */

app.get(
    "/api/stats",
    async (req, res) => {

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );

            const members =
                await guild.members.fetch();

            const totalMembers =
                guild.memberCount;

            const onlineMembers =
                members.filter(
                    member =>
                        member.presence &&
                        member.presence.status !==
                        "offline"
                ).size;

            const boostLevel =
                guild.premiumTier;

            const totalBoosts =
                guild.premiumSubscriptionCount || 0;

            res.json({

                success: true,

                server: {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL({
                        extension: "png",
                        size: 512
                    })
                },

                stats: {
                    members: totalMembers,
                    online: onlineMembers,
                    boostLevel: boostLevel,
                    boosts: totalBoosts,
                    status: "online"
                }

            });

        } catch (error) {

            console.error(
                "Stats Error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "Failed to fetch Discord server stats"

            });

        }

    }
);


/* =========================
   START API SERVER
========================= */

app.listen(
    PORT,
    () => {

        console.log(
            `API running on port ${PORT}`
        );

    }
);


/* =========================
   LOGIN DISCORD BOT
========================= */

client.login(
    process.env.DISCORD_TOKEN
);