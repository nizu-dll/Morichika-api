import "dotenv/config";
import express from "express";
import cors from "cors";

import {
    Client,
    GatewayIntentBits
} from "discord.js";


/* =========================================
   EXPRESS APP
========================================= */

const app = express();

app.use(cors());

app.use(express.json());


/* =========================================
   DISCORD CLIENT
========================================= */

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildPresences,

        GatewayIntentBits.GuildVoiceStates

    ]

});


/* =========================================
   ENVIRONMENT VARIABLES
========================================= */

const PORT =
    process.env.PORT || 3000;


const GUILD_ID =
    process.env.GUILD_ID;


/* =========================================
   DISCORD BOT READY
========================================= */

client.once(
    "ready",
    () => {

        console.log(
            `Bot logged in as ${client.user.tag}`
        );


        console.log(
            `Connected to ${client.guilds.cache.size} server(s)`
        );


        const guild =
            client.guilds.cache.get(
                GUILD_ID
            );


        if (guild) {

            console.log(
                `Connected to: ${guild.name}`
            );

        } else {

            console.log(
                "Warning: Target server not found"
            );

        }

    }
);


/* =========================================
   API STATUS
========================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

            name:
                "Morichika Stats API",

            status:
                "online"

        });

    }
);


/* =========================================
   SERVER INFORMATION API
========================================= */

app.get(
    "/api/server",
    async (
        req,
        res
    ) => {

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );


            res.json({

                success:
                    true,

                server: {

                    id:
                        guild.id,

                    name:
                        guild.name,

                    icon:
                        guild.iconURL({
                            extension:
                                "png",

                            size:
                                512
                        }),

                    banner:
                        guild.bannerURL({
                            extension:
                                "png",

                            size:
                                2048
                        }),

                    description:
                        guild.description ||
                        "Where Kind Souls Gather Beneath the Desert Moon.",

                    memberCount:
                        guild.memberCount,

                    boostLevel:
                        guild.premiumTier,

                    totalBoosts:
                        guild.premiumSubscriptionCount ||
                        0

                }

            });

        } catch (
            error
        ) {

            console.error(
                "Server Info Error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                error:
                    "Failed to fetch server information"

            });

        }

    }
);


/* =========================================
   SERVER STATS API
========================================= */

app.get(
    "/api/stats",
    async (
        req,
        res
    ) => {

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


            const inVoiceMembers =
                members.filter(
                    member =>

                        member.voice &&

                        member.voice.channel

                ).size;


            const boostLevel =
                guild.premiumTier;


            const totalBoosts =
                guild.premiumSubscriptionCount ||
                0;


            res.json({

                success:
                    true,

                server: {

                    id:
                        guild.id,

                    name:
                        guild.name,

                    icon:
                        guild.iconURL({
                            extension:
                                "png",

                            size:
                                512
                        })

                },

                stats: {

                    members:
                        totalMembers,

                    online:
                        onlineMembers,

                    boostLevel:
                        boostLevel,

                    boosts:
                        totalBoosts,

                    inVoice:
                        inVoiceMembers,

                    status:
                        "online"

                }

            });

        } catch (
            error
        ) {

            console.error(
                "Stats Error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                error:
                    "Failed to fetch Discord server stats"

            });

        }

    }
);


/* =========================================
   LIVE ONLINE MEMBERS API
========================================= */

app.get(
    "/api/members/online",
    async (
        req,
        res
    ) => {

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );


            const members =
                await guild.members.fetch();


            const onlineMembers =
                members
                    .filter(
                        member => {

                            return (

                                !member.user.bot &&

                                member.presence &&

                                member.presence.status !==
                                "offline"

                            );

                        }
                    )
                    .map(
                        member => {

                            return {

                                id:
                                    member.id,

                                username:
                                    member.user.username,

                                displayName:
                                    member.displayName,

                                avatar:
                                    member.displayAvatarURL({
                                        extension:
                                            "png",

                                        size:
                                            256
                                    }),

                                status:
                                    member.presence.status

                            };

                        }
                    );


            res.json({

                success:
                    true,

                count:
                    onlineMembers.length,

                members:
                    onlineMembers

            });

        } catch (
            error
        ) {

            console.error(
                "Online Members Error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                error:
                    "Failed to fetch online members"

            });

        }

    }
);


/* =========================================
   LIVE VOICE CHANNELS API
========================================= */

app.get(
    "/api/voice",
    async (
        req,
        res
    ) => {

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );


            const channels =
                guild.channels.cache
                    .filter(
                        channel =>

                            channel.isVoiceBased() &&

                            channel.members.size > 0

                    )
                    .map(
                        channel => {

                            return {

                                id:
                                    channel.id,

                                name:
                                    channel.name,

                                memberCount:
                                    channel.members.size,

                                members:
                                    channel.members.map(
                                        member => {

                                            return {

                                                id:
                                                    member.id,

                                                name:
                                                    member.displayName,

                                                username:
                                                    member.user.username,

                                                avatar:
                                                    member.displayAvatarURL({
                                                        extension:
                                                            "png",

                                                        size:
                                                            128
                                                    })

                                            };

                                        }
                                    )

                            };

                        }
                    );


            const totalMembers =
                channels.reduce(
                    (
                        total,
                        channel
                    ) =>

                        total +
                        channel.memberCount,

                    0
                );


            res.json({

                success:
                    true,

                totalChannels:
                    channels.length,

                totalMembers:
                    totalMembers,

                channels:
                    channels

            });

        } catch (
            error
        ) {

            console.error(
                "Voice Channels Error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                error:
                    "Failed to fetch live voice channels"

            });

        }

    }
);


/* =========================================
   LIVE ROSTER API
========================================= */

app.get(
    "/api/roster",
    async (
        req,
        res
    ) => {

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );


            const members =
                await guild.members.fetch();


            /* =====================================
               MORICHIKA STAFF ROLES
            ===================================== */

            const roleGroups = [

                {

                    key:
                        "founder",

                    name:
                        "Founder",

                    icon:
                        "👑"

                },

                {

                    key:
                        "co-founder",

                    name:
                        "Co-Founder",

                    icon:
                        "🛡️"

                },

                {

                    key:
                        "senior-mod",

                    name:
                        "Senior Mod",

                    icon:
                        "⚔️"

                },

                {

                    key:
                        "admin",

                    name:
                        "Admin",

                    icon:
                        "🔱"

                },

                {

                    key:
                        "moderator",

                    name:
                        "Moderator",

                    icon:
                        "🛠️"

                }

            ];


            const roster = {};


            /* =====================================
               FIND MEMBERS BY ROLE
            ===================================== */

            for (
                const group
                of roleGroups
            ) {

                const role =
                    guild.roles.cache.find(
                        role =>

                            role.name.toLowerCase() ===
                            group.name.toLowerCase()

                    );


                if (!role) {

                    roster[
                        group.key
                    ] = {

                        name:
                            group.name,

                        icon:
                            group.icon,

                        count:
                            0,

                        members:
                            []

                    };


                    continue;

                }


                const roleMembers =
                    members
                        .filter(
                            member =>

                                member.roles.cache.has(
                                    role.id
                                )

                        )
                        .map(
                            member => {

                                return {

                                    id:
                                        member.id,

                                    username:
                                        member.user.username,

                                    displayName:
                                        member.displayName,

                                    avatar:
                                        member.displayAvatarURL({
                                            extension:
                                                "png",

                                            size:
                                                256
                                        }),

                                    online:

                                        member.presence &&

                                        member.presence.status !==
                                        "offline",

                                    status:

                                        member.presence?.status ||

                                        "offline"

                                };

                            }
                        );


                roster[
                    group.key
                ] = {

                    name:
                        group.name,

                    icon:
                        group.icon,

                    count:
                        roleMembers.length,

                    members:
                        roleMembers

                };

            }


            /* =====================================
               TOTAL ONLINE MEMBERS
            ===================================== */

            const onlineCount =
                members.filter(
                    member =>

                        !member.user.bot &&

                        member.presence &&

                        member.presence.status !==
                        "offline"

                ).size;


            res.json({

                success:
                    true,

                online:
                    onlineCount,

                roster:
                    roster

            });


        } catch (
            error
        ) {

            console.error(
                "Roster Error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                error:
                    "Failed to fetch live roster"

            });

        }

    }
);


/* =========================================
   START API SERVER
========================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `API running on port ${PORT}`
        );

    }
);


/* =========================================
   LOGIN DISCORD BOT
========================================= */

client.login(
    process.env.DISCORD_TOKEN
);
