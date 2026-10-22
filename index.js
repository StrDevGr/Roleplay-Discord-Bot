const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  PermissionFlagsBits,
  ChannelType,
  AuditLogEvent,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  AttachmentBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require("discord.js");

const fs     = require("fs");
const path   = require("path");
const crypto = require("crypto");
const sqlite3 = require("better-sqlite3");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const TOKEN       = process.env.DISCORD_TOKEN || "";
const CONFIG_PATH = path.join(__dirname, "log_channels.json");
const THUMBNAIL_LOGO = process.env.THUMBNAIL_LOGO || "";

//ticket
const LOG_CHANNEL_ID         = "";
const STAFF_ROLE_ID          = "";
const MANAGER_ROLE_ID        = "";
const OWNER_ROLE_ID          = "";
const DONATE_MANAGER_ROLE_ID = "";
const GUILD_ID               = "";

// ── Duty system — On Duty voice channel IDs ────────────────────────────────
const DUTY_VOICE_CHANNELS = [
  "1431254858232496268",  // On Duty VC 1
  "1431254860690358322",  // On Duty VC 2
];

// ── Temp Voice channels — each join-to-create VC ──────────────────────────
// key = join-to-create channel ID → { name, roleId, logChannelId }
const TEMP_VOICE_CONFIG = {
  "": { name: "📞Support",      roleId: "", logChannelId: "" },
  "": { name: "💸Donate",        roleId: "", logChannelId: "" },
  "": { name: "🔫Mafia",         roleId: "", logChannelId: "" },
  "": { name: "🎙Interview",      roleId: "", logChannelId: "" },
  "": { name: "💻Anticheat",      roleId: "", logChannelId: "" },
  "": { name: "🕺Civilian Job",   roleId: "", logChannelId: "" },
};

const INVITE_LOG_CHANNEL_ID    = ""; // #invite-logs
const GIVEAWAY_LOG_CHANNEL_ID  = ""; // #giveaway-logs
const GIVEAWAY_MANAGER_ROLE_ID = ""; // who can run giveaways

// ── Auto-Role — role given to every new member on join ────────────────────
const AUTOROLE_ID = ""; // ← replace with your role ID

// ── Duty panel channel — where !setupduty is run ─────────────────────────
const DUTY_PANEL_CHANNEL_ID = ""; // ← replace

const SERVER_LOGO   = "";
const SERVER_BANNER = "";

// ── Staff app role IDs (one per type) ─────────────────────────────────────────
const STAFF_APP_ROLES = {
  staff:      "",
  anticheat:  "",
  elas:       "",
  ekab:       "",
  dimarxeio:  "",
};

const REVIEW_CHANNELS = {
  staff:      "",
  anticheat:  "",
  elas:       "",
  ekab:       "",
  dimarxeio:  "",
};

const APP_RESPONSE_CHANNELS = {
  staff:      "",
  anticheat:  "",
  elas:       "",
  ekab:       "",
  dimarxeio:  "",
};

const APP_REVIEWER_ROLES = {
  staff:      "",
  anticheat:  "",
  elas:       "",
  ekab:       "",
  dimarxeio:  "",
};

// ── Criminal apps config ───────────────────────────────────────────────────────
const CRIM_CONFIG = {
  APPLICATIONS_CHANNEL_ID: "",
  REVIEWER_ROLE_ID:        "",
  ACCEPTED_ROLE_ID:        "",
  CRIMINAL_CATEGORY_ID:    "",

  BANNER_URL: "",

  C_GOLD:   0xFFD700,
  C_GREEN:  0x2ECC71,
  C_RED:    0xE74C3C,
  C_ORANGE: 0xE67E22,

  teams: {
    mafias: [
      { name: "Cosa Nostra",       available: true  },
      { name: "Camorra Mafia",     available: true  },
      { name: "Ndrangheta Mafia",  available: true  },
      { name: "Sicilian Mafia",    available: true  },
      { name: "Bratva",            available: true  },
      { name: "Vor V Zakone",      available: true  },
      { name: "Triads",            available: true  },
      { name: "Yakuza",            available: true  },
    ],
    cartels: [
      { name: "Cartel Del Norte",   available: true  },
      { name: "Cartel De Tijuana",  available: true  },
      { name: "Cartel Juárez",      available: false },
      { name: "Cartel De Bogotá",   available: true  },
      { name: "Cartel De Medellín", available: true  },
      { name: "Cartel Sinaloa",     available: true  },
      { name: "Cartel Jalisco",     available: true  },
      { name: "Cartel Los Zetas",   available: true  },
      { name: "Cartel Del Golfo",   available: true  },
    ],
    gangs: [
      { name: "Ballas",      available: true  },
      { name: "Vaggos",      available: true  },
      { name: "Families",    available: true  },
      { name: "Bloods",      available: true  },
      { name: "Crips",       available: true  },
      { name: "Marabunta",   available: true  },
      { name: "MS13",        available: true  },
      { name: "Vatos Locos", available: false },
      { name: "Latin Kings", available: true  },
      { name: "Surrenos",    available: true  },
    ],
  },
};

// ── Ticket types ───────────────────────────────────────────────────────────────
const TICKET_TYPES = {
  donate: {
    label:        "Donate",
    emoji:        { name: "💸" },
    categoryName: "💸 Donate Tickets",
    roles:        [DONATE_MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  support: {
    label:        "Support Ticket",
    emoji:        { name: "🛡️" },
    categoryName: "🛡️ Support Tickets",
    roles:        [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  staff_report: {
    label:        "Staff Report",
    emoji:        { name: "📞" },
    categoryName: "📞 Staff Reports",
    roles:        [MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  ban_appeal: {
    label:        "Ban Appeal",
    emoji:        { name: "🚫" },
    categoryName: "🚫 Ban Appeals",
    roles:        [MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  bug_report: {
    label:        "Bug Report",
    emoji:        { name: "🐛" },
    categoryName: "🐛 Bug Reports",
    roles:        [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  crash_report: {
    label:        "Crash Report",
    emoji:        { name: "💥" },
    categoryName: "💥 Crash Reports",
    roles:        [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  lost_items: {
    label:        "Lost Items",
    emoji:        { name: "🔴" },
    categoryName: "🔴 Lost Items",
    roles:        [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
  other: {
    label:        "Other",
    emoji:        { name: "❓" },
    categoryName: "❓ Other Tickets",
    roles:        [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID],
  },
};

// ── Staff App types ────────────────────────────────────────────────────────────
const STAFF_APP_TYPES = {
  staff: {
    label: "Staff", emoji: "🛡️",
    description: "Γίνε μέλος στο staff team και βοήθησε στην παροχή γρήγορης και ακριβούς υποστήριξης!",
    color: 0x5865F2,
  },
  anticheat: {
    label: "Anticheat", emoji: "🔍",
    description: "Γίνε μέλος στο anticheat team και βοήθησε στην παροχή γρήγορης και ακριβούς υποστήριξης!",
    color: 0xED4245,
  },
  elas: {
    label: "ΕΛ.ΑΣ", emoji: "👮",
    description: "Γίνε η ασπίδα της πόλης, προστάτευσε και υπηρέτησε! Συμπλήρωσε την αίτησή σου!",
    color: 0x3BA55C,
  },
  ekab: {
    label: "Ε.Κ.Α.Β", emoji: "🚑",
    description: "Γίνε η πρώτη γραμμή βοήθειας, πρόσφερε φροντίδα όταν μετρά κάθε δευτερόλεπτο!",
    color: 0xFEE75C,
  },
  dimarxeio: {
    label: "ΔΗΜΑΡΧΕΙΟ", emoji: "🏛️",
    description: "Συμμετέχε στη διοίκηση της πόλης και βοήθησε στην ανάπτυξη του Community!",
    color: 0xEB459E,
  },
};

const STAFF_APP_MODALS = {
  staff: [
    { id: "age",         label: "Ποια είναι η ηλικία σας;",                 style: TextInputStyle.Short,     placeholder: "π.χ. 20"                    },
    { id: "steam_id",    label: "Γράψτε μας το Steam ID σας",               style: TextInputStyle.Short,     placeholder: "π.χ. 76561198XXXXXXXXX"     },
    { id: "fivem_hours", label: "Πόσες ώρες έχετε στην FiveM;",            style: TextInputStyle.Short,     placeholder: "π.χ. 500"                   },
    { id: "hierarchy",   label: "Τι σημαίνει η Ιεραρχία για εσάς;",        style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..." },
    { id: "staff_role",  label: "Ποιος είναι ο βασικός ρόλος ενός Staff;", style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..." },
  ],
  anticheat: [
    { id: "scan_tool",       label: "Τι scan χρησιμοποιείς;",                        style: TextInputStyle.Short,     placeholder: "π.χ. Screenshare, Memory analysis" },
    { id: "experience",      label: "Προϋπηρεσία",                                   style: TextInputStyle.Paragraph, placeholder: "Περιέγραψε την εμπειρία σου..."    },
    { id: "false_results",   label: "Πως καταλαβαίνεις αν τα results είναι false;", style: TextInputStyle.Short,     placeholder: "Γράψτε την απάντησή σας..."        },
    { id: "suspicious_clip", label: "Βήματα μετά από ύποπτο clip;",                 style: TextInputStyle.Paragraph, placeholder: "Γράψτε τα βήματά σας..."          },
    { id: "cheat_detected",  label: "Τι κάνεις αν το scan δείξει cheat;",           style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."        },
  ],
  elas: [
    { id: "irl_info",        label: "Όνομα (IRL) & Ηλικία",                          style: TextInputStyle.Short,     placeholder: "π.χ. Nikos, 22"            },
    { id: "prev_experience", label: "Έχετε ξαναδουλέψει στην Ελληνική Αστυνομία;",  style: TextInputStyle.Paragraph, placeholder: "Αν ναι, μέχρι τι βαθμίδα;" },
    { id: "primary_weapon",  label: "Ποιο είναι το βασικό όπλο του Αστυνομικού;",   style: TextInputStyle.Short,     placeholder: "Γράψτε την απάντησή σας..."  },
    { id: "hierarchy",       label: "Τι σημαίνει ιεραρχία και υπακοή;",             style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."  },
    { id: "duties",          label: "Ποια πιστεύετε ότι είναι τα καθήκοντά σας;",  style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."  },
  ],
  ekab: [
    { id: "irl_info",        label: "Όνομα (IRL) & Ηλικία",                        style: TextInputStyle.Short,     placeholder: "π.χ. Maria, 21"            },
    { id: "prev_experience", label: "Έχετε ξαναδουλέψει στο Ε.Κ.Α.Β;",            style: TextInputStyle.Paragraph, placeholder: "Αν ναι, πού και για πόσο;"  },
    { id: "emergency",       label: "Πώς χειρίζεστε μια επείγουσα κατάσταση;",    style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."  },
    { id: "hierarchy",       label: "Τι σημαίνει ιεραρχία και υπακοή;",           style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."  },
    { id: "duties",          label: "Ποια πιστεύετε ότι είναι τα καθήκοντά σας;", style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."  },
  ],
  dimarxeio: [
    { id: "irl_info",        label: "Όνομα (IRL) & Ηλικία",                        style: TextInputStyle.Short,     placeholder: "π.χ. Giorgos, 25"              },
    { id: "prev_experience", label: "Έχετε εμπειρία σε διοικητικούς ρόλους;",      style: TextInputStyle.Paragraph, placeholder: "Περιγράψτε την εμπειρία σας..." },
    { id: "city_vision",     label: "Ποια είναι η δική σας όραση για την πόλη;",   style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."      },
    { id: "hierarchy",       label: "Τι σημαίνει ιεραρχία και υπακοή για εσάς;",  style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."      },
    { id: "duties",          label: "Ποια πιστεύετε ότι είναι τα καθήκοντά σας;", style: TextInputStyle.Paragraph, placeholder: "Γράψτε την απάντησή σας..."      },
  ],
};

const STAFF_APP_FIELD_LABELS = {
  staff:     { age: "Ηλικία", steam_id: "Steam ID", fivem_hours: "Ώρες FiveM", hierarchy: "Ιεραρχία", staff_role: "Ρόλος Staff" },
  anticheat: { scan_tool: "Scan Tool", experience: "Προϋπηρεσία", false_results: "False Results", suspicious_clip: "Ύποπτο Clip", cheat_detected: "Cheat Detected" },
  elas:      { irl_info: "IRL Info", prev_experience: "Προϋπηρεσία", primary_weapon: "Βασικό Όπλο", hierarchy: "Ιεραρχία", duties: "Καθήκοντα" },
  ekab:      { irl_info: "IRL Info", prev_experience: "Προϋπηρεσία", emergency: "Επείγουσα", hierarchy: "Ιεραρχία", duties: "Καθήκοντα" },
  dimarxeio: { irl_info: "IRL Info", prev_experience: "Εμπειρία", city_vision: "Όραση", hierarchy: "Ιεραρχία", duties: "Καθήκοντα" },
};

// ══════════════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════════════

// ── Duty state ────────────────────────────────────────────────────────────────
const dutyDB = new sqlite3(path.join(__dirname, "duty.db"));
dutyDB.exec(`
  CREATE TABLE IF NOT EXISTS duty_users (
    user_id TEXT PRIMARY KEY,
    total_seconds INTEGER DEFAULT 0,
    is_on_duty INTEGER DEFAULT 0
  )
`);
const dutyStartTimes = new Map(); // userId → timestamp (ms)

// ── Temp voice state ──────────────────────────────────────────────────────────
const tempVoiceChannels = new Map(); // created channelId → ownerUserId

const activeTickets   = new Map();   // userId → ticketData
const ticketMessages  = new Map();   // channelId → messages[]
const claimedTickets  = new Map();   // channelId → { userId, tag }
const appAnswerCache  = new Map();   // messageId → { typeKey, user, answers }  (staff apps)
const crimPending     = new Map();   // appId → { userId, type, answers }       (crim apps)
let   crimAppSeq      = 0;

// ══════════════════════════════════════════════════════════════════════════════
//  GENERAL HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function generateTicketId() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function ensureCategory(guild, name) {
  let cat = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === name
  );
  if (!cat) cat = await guild.channels.create({ name, type: ChannelType.GuildCategory });
  return cat;
}

function isStaff(member) {
  if (!member) return false;
  return [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID, DONATE_MANAGER_ROLE_ID]
    .some((id) => member.roles.cache.has(id));
}

function nowTs() {
  return Math.floor(Date.now() / 1000);
}

function ts(date = new Date()) {
  return `<t:${Math.floor(date.getTime() / 1000)}:f>`;
}

// ── Criminal helpers ──────────────────────────────────────────────────────────
function teamsList(arr) {
  return arr.map((t) => `${t.available ? "🟢" : "🔴"} **${t.name}**`).join("\n");
}

function findTeam(name) {
  for (const cat of ["mafias", "cartels", "gangs"]) {
    const idx = CRIM_CONFIG.teams[cat].findIndex(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (idx !== -1) return { cat, idx };
  }
  return null;
}

async function getOrCreateCrimCategory(guild) {
  if (CRIM_CONFIG.CRIMINAL_CATEGORY_ID) {
    const c = guild.channels.cache.get(CRIM_CONFIG.CRIMINAL_CATEGORY_ID);
    if (c) return c;
  }
  const found = guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildCategory &&
      c.name.toLowerCase() === "🔫criminal teams"
  );
  if (found) return found;
  return guild.channels.create({
    name: "🔫criminal teams",
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    ],
  });
}

// Safe ephemeral follow-up (used after deferUpdate)
async function safeEphemeral(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ ...payload, flags: (payload.flags ?? 0) | MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ ...payload, flags: (payload.flags ?? 0) | MessageFlags.Ephemeral });
    }
  } catch (e) {
    console.error("[safeEphemeral]", e.message);
  }
}

// Staff app permission check
function canReviewStaffApp(member, typeKey) {
  if (!member) return false;
  const reviewerRoleId = APP_REVIEWER_ROLES[typeKey];
  if (!reviewerRoleId) return false;
  return (
    member.roles.cache.has(reviewerRoleId) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOG HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function loadLogConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function saveLogConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

function getLogChannel(guildId, logType) {
  const config    = loadLogConfig();
  const channelId = config?.[guildId]?.[logType];
  if (!channelId) return null;
  return client.channels.cache.get(channelId) || null;
}

function buildEmbed(guild, color, title, fields) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(THUMBNAIL_LOGO)
    .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .addFields(fields)
    .setFooter({ text: `${guild.name} - ${title}`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .setTimestamp();
}

const LOG_CHANNELS = {
  join:     "📥join-logs",
  leave:    "📤leave-logs",
  kick:     "👢kick-logs",
  ban:      "🔨ban-logs",
  unban:    "🔓unban-logs",
  message:  "💬message-logs",
  voice:    "🔊voice-logs",
  role:     "🏷️role-logs",
  nickname: "✏️nickname-logs",
  channel:  "📁channel-logs",
  command:  "🔧command-logs",
  clear:    "🧹clear-logs",
};

// ══════════════════════════════════════════════════════════════════════════════
//  HTML TRANSCRIPT
// ══════════════════════════════════════════════════════════════════════════════
function generateHtmlTranscript(ticketId, ticketData, messages) {
  const rows = messages.map((msg) => {
    if (msg.type === "system") {
      return `<tr class="sys"><td colspan="3">⚙️ ${escapeHtml(msg.content)} — ${escapeHtml(msg.timestamp)}</td></tr>`;
    }
    let badge = "";
    if (Array.isArray(msg.roles)) {
      if (msg.roles.includes(OWNER_ROLE_ID))        badge = '<span class="badge owner">OWNER</span>';
      else if (msg.roles.includes(MANAGER_ROLE_ID)) badge = '<span class="badge mgr">MANAGER</span>';
      else if (msg.roles.includes(STAFF_ROLE_ID))   badge = '<span class="badge staff">STAFF</span>';
    }
    return `<tr>
      <td class="ts">${escapeHtml(msg.timestamp)}</td>
      <td class="au">${escapeHtml(msg.author ?? "Unknown")}${badge}</td>
      <td class="ct">${escapeHtml(msg.content)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Transcript — ${ticketId}</title>
<style>
  :root{--bg:#0d0f17;--sur:#151824;--bdr:#252a3d;--acc:#7c5cfc;--acc2:#a78bfa;--tx:#e2e8f0;--mu:#64748b;--stf:#06b6d4;--mgr:#f97316;--own:#ef4444}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--tx);font-family:'Segoe UI',system-ui,sans-serif;padding:24px}
  h1{font-size:1.5rem;color:var(--acc2);margin-bottom:4px}
  .sub{color:var(--mu);font-size:.82rem;margin-bottom:22px}
  .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-bottom:24px}
  .mc{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;padding:12px 14px}
  .mc .l{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mu);margin-bottom:3px}
  .mc .v{font-size:.92rem}
  table{width:100%;border-collapse:collapse;background:var(--sur);border:1px solid var(--bdr);border-radius:10px;overflow:hidden}
  thead th{background:var(--bdr);padding:9px 13px;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--mu)}
  td{padding:9px 13px;border-bottom:1px solid var(--bdr);font-size:.86rem;vertical-align:top}
  td.ts{color:var(--mu);white-space:nowrap;width:155px}
  td.au{white-space:nowrap;width:175px;font-weight:600}
  td.ct{line-height:1.6;word-break:break-word}
  tr.sys td{background:rgba(245,158,11,.07);color:#f59e0b;font-style:italic;font-size:.8rem;text-align:center;padding:6px}
  .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:.65rem;font-weight:700;margin-left:5px;vertical-align:middle}
  .badge.staff{background:var(--stf);color:#fff}.badge.mgr{background:var(--mgr);color:#fff}.badge.owner{background:var(--own);color:#fff}
  .foot{margin-top:18px;text-align:center;color:var(--mu);font-size:.76rem}
</style>
</head>
<body>
<h1>🎫 Ticket Transcript</h1>
<p class="sub">Apex Roleplay™ — official support record</p>
<div class="meta">
  <div class="mc"><div class="l">Ticket ID</div><div class="v">${ticketId}</div></div>
  <div class="mc"><div class="l">Category</div><div class="v">${escapeHtml(ticketData.category)}</div></div>
  <div class="mc"><div class="l">Creator</div><div class="v">${escapeHtml(ticketData.creator)}</div></div>
  <div class="mc"><div class="l">Created At</div><div class="v">${escapeHtml(ticketData.createdAt)}</div></div>
  <div class="mc"><div class="l">Closed At</div><div class="v">${escapeHtml(ticketData.closedAt ?? "Still Open")}</div></div>
  <div class="mc"><div class="l">Closed By</div><div class="v">${escapeHtml(ticketData.closedBy ?? "N/A")}</div></div>
</div>
<table>
  <thead><tr><th>Time</th><th>Author</th><th>Message</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="foot">Generated by Apex Roleplay™ Ticket System</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TICKET — COMPONENT V2 BUILDERS
// ══════════════════════════════════════════════════════════════════════════════
function buildTicketMenuPayload() {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: 17,
        accent_color: 0xf5c518,
        components: [
          {
            type: 10,
            content:
              "## <:logo:1472649971013783685> Apex Roleplay™ | Ticket System\n" +
              "**```Για την άμεση εξυπηρέτησή σας μπορείτε να ανοίξετε ένα ticket ώστε να μιλήσετε με κάποιον ανώτερο και να λύσετε το πρόβλημά σας.```**",
          },
          {
            type: 12,
            items: [{ media: { url: SERVER_BANNER }, description: " <:logo:1472649971013783685> Apex Roleplay" }],
          },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "ticket_select",
                placeholder: "Choose a category",
                options: Object.entries(TICKET_TYPES).map(([value, t]) => ({
                  label: t.label, description: t.description, emoji: t.emoji, value,
                })),
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildTicketOpenPayload(user, typeKey, ticketId, roleMentions) {
  const t  = TICKET_TYPES[typeKey];
  const stamp = nowTs();
  const staffLine = roleMentions.length
    ? `\n> 👥 **Staff Notified:** ${roleMentions.join(", ")}`
    : "";
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: 17,
        accent_color: 0xf5c518,
        components: [
          { type: 10, content: `## <:logo:1472649971013783685> Apex Roleplay™ | ${t.label}` },
          { type: 14, divider: true, spacing: 0 },
          {
            type: 10,
            content: `**\`\`\`Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα! Αν θελετε να κλεισετε το ticket αντιδραστε με 🔒\`\`\`**${staffLine}`,
          },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 1,
            components: [
              { type: 2, style: ButtonStyle.Danger,    label: "Delete Ticket", emoji: { name: "🔒" }, custom_id: `close_ticket_${ticketId}` },
              { type: 2, style: ButtonStyle.Secondary, label: "Claim",         emoji: { name: "🤝" }, custom_id: `claim_ticket_${ticketId}` },
              { type: 2, style: ButtonStyle.Secondary, label: "Ping",          emoji: { name: "🔔" }, custom_id: `ping_ticket_${ticketId}` },
            ],
          },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${stamp}:F>` },
        ],
      },
    ],
  };
}

function buildTicketCreatedEphemeral(typeKey, ticketChannel) {
  const t = TICKET_TYPES[typeKey];
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [
      {
        type: 17,
        accent_color: 0x22c55e,
        components: [
          { type: 10, content: `Your Ticket ${t.emoji?.name ?? "🎫"} <#${ticketChannel.id}>` },
        ],
      },
    ],
  };
}

function buildLogOpenPayload(user, typeKey, ticketId, ticketChannel, roleMentions) {
  const t     = TICKET_TYPES[typeKey];
  const stamp = nowTs();
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: 17,
        accent_color: 0x22c55e,
        components: [
          {
            type: 9,
            components: [
              {
                type: 10,
                content:
                  `## <:logo:1472649971013783685> Ticket Created\n` +
                  `> ✅ **Opened By:** <@${user.id}> \`(${user.id})\`\n` +
                  `> 📁 **Category:** ${t.label}\n` +
                  `> 🆔 **Ticket ID:** \`${ticketId}\`\n` +
                  `> 💬 **Channel:** <#${ticketChannel.id}>\n` +
                  `> ⏰ **Created:** <t:${stamp}:F>\n` +
                  `> 👥 **Access:** ${roleMentions.join(", ") || "No roles"}`,
              },
            ],
            accessory: { type: 11, media: { url: user.displayAvatarURL() } },
          },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ Support System • <t:${stamp}:F>` },
        ],
      },
    ],
  };
}

function buildLogClosePayload(ticketId, ticketData, messageCount) {
  const createdTs = Math.floor(new Date(ticketData.createdAt.replace(" ", "T")).getTime() / 1000);
  const closedTs  = nowTs();
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: 17,
        accent_color: 0xf43f5e,
        components: [
          {
            type: 9,
            components: [
              {
                type: 10,
                content:
                  `## 🔒 Ticket Closed\n` +
                  `**The Ticket Closed, you can view the full ticket transcript by Download-Transcript**\n\n` +
                  `> ✅ **Opened By:** <@${ticketData.creatorId}>\n` +
                  `> ❌ **Closed By:** ${escapeHtml(ticketData.closedBy ?? "Unknown")}\n` +
                  `> 📁 **Category:** ${escapeHtml(ticketData.category)}\n` +
                  `> 💬 **Channel:** \`${escapeHtml(ticketData.channelName ?? "unknown")}\`\n` +
                  `> 🆔 **Ticket ID:** \`${ticketId}\`\n` +
                  `> ⏰ **Opened:** <t:${createdTs}:F>\n` +
                  `> 🕐 **Closed:** <t:${closedTs}:F>\n` +
                  `> 💬 **Messages:** ${messageCount}`,
              },
            ],
            accessory: { type: 11, media: { url: SERVER_LOGO } },
          },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ Support System • <t:${closedTs}:F>` },
        ],
      },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  STAFF APP — COMPONENT V2 BUILDERS
// ══════════════════════════════════════════════════════════════════════════════
function buildApplicationsPanelPayload() {
  const stamp    = nowTs();
  const sections = Object.entries(STAFF_APP_TYPES).map(([key, app]) => ({
    type: 9,
    components: [{ type: 10, content: `### ${app.emoji} ${app.label}\n${app.description}` }],
    accessory: { type: 2, style: ButtonStyle.Secondary, label: app.label, emoji: { name: app.emoji }, custom_id: `staffapply_${key}` },
  }));
  const components = [
    { type: 10, content: "## <:logo:1472649971013783685> Apex Roleplay™ | Αιτήσεις\n" },
    { type: 12, items: [{ media: { url: SERVER_BANNER } }] },
    { type: 14, divider: true, spacing: 1 },
  ];
  for (let i = 0; i < sections.length; i++) {
    components.push(sections[i]);
    if (i < sections.length - 1) components.push({ type: 14, divider: true, spacing: 1 });
  }
  components.push({ type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${stamp}:F>` });
  return { flags: MessageFlags.IsComponentsV2, components: [{ type: 17, accent_color: 0xf5c518, components }] };
}

function buildStaffApplyConfirmEphemeral(typeKey) {
  const app = STAFF_APP_TYPES[typeKey];
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0x57F287,
      components: [{
        type: 10,
        content:
          `## ✅ Η αίτησή σου στάλθηκε!\n` +
          `Η αίτησή σου για **${app.emoji} ${app.label}** έχει σταλεί στο staff για αξιολόγηση.\n` +
          `Θα ειδοποιηθείς για το αποτέλεσμα σύντομα. 🎮`,
      }],
    }],
  };
}

function buildStaffReviewPayload(typeKey, user, answers) {
  const app            = STAFF_APP_TYPES[typeKey];
  const labels         = STAFF_APP_FIELD_LABELS[typeKey];
  const stamp          = nowTs();
  const reviewerRoleId = APP_REVIEWER_ROLES[typeKey];

  const answerBlocks = [];
  const entries = Object.entries(answers);
  for (let i = 0; i < entries.length; i++) {
    const [fieldId, value] = entries[i];
    answerBlocks.push({ type: 10, content: `**${labels[fieldId] ?? fieldId}**\n${value || "*Κενό*"}` });
    if (i < entries.length - 1) answerBlocks.push({ type: 14, divider: true, spacing: 0 });
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: app.color,
      components: [
        {
          type: 9,
          components: [{
            type: 10,
            content:
              `## ${app.emoji} Νέα Αίτηση — ${app.label}\n` +
              `> 👤 **Αιτών:** <@${user.id}> \`(${user.tag})\`\n` +
              `> 🆔 **User ID:** \`${user.id}\`\n` +
              `> ⏰ **Ημερομηνία:** <t:${stamp}:F>\n` +
              `> 🔑 **Reviewer Role:** <@&${reviewerRoleId}>`,
          }],
          accessory: { type: 11, media: { url: user.displayAvatarURL({ extension: "png", size: 256 }) } },
        },
        { type: 14, divider: true, spacing: 1 },
        ...answerBlocks,
        { type: 14, divider: true, spacing: 1 },
        {
          type: 1,
          components: [
            { type: 2, style: ButtonStyle.Success, label: "Αποδοχή",  emoji: { name: "✅" }, custom_id: `staffaccept_${typeKey}_${user.id}` },
            { type: 2, style: ButtonStyle.Danger,  label: "Απόρριψη", emoji: { name: "❌" }, custom_id: `staffreject_${typeKey}_${user.id}` },
          ],
        },
        { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${stamp}:F>` },
      ],
    }],
  };
}

function buildStaffReviewDecidedPayload(typeKey, user, answers, decision, reviewerTag) {
  const app          = STAFF_APP_TYPES[typeKey];
  const labels       = STAFF_APP_FIELD_LABELS[typeKey];
  const stamp        = nowTs();
  const isAccepted   = decision === "accept";
  const accentColor  = isAccepted ? 0x57F287 : 0xED4245;
  const verdictEmoji = isAccepted ? "✅" : "❌";
  const verdictText  = isAccepted ? "ΕΓΚΡΙΘΗΚΕ" : "ΑΠΟΡΡΙΦΘΗΚΕ";
  const verdictLine  = `\n> ${verdictEmoji} **Απόφαση:** ${verdictText}\n> 🛡️ **Αξιολογήθηκε από:** ${reviewerTag}\n> ⏰ **Στις:** <t:${stamp}:F>`;

  const answerBlocks = [];
  const entries = Object.entries(answers);
  for (let i = 0; i < entries.length; i++) {
    const [fieldId, value] = entries[i];
    answerBlocks.push({ type: 10, content: `**${labels[fieldId] ?? fieldId}**\n${value || "*Κενό*"}` });
    if (i < entries.length - 1) answerBlocks.push({ type: 14, divider: true, spacing: 0 });
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: accentColor,
      components: [
        {
          type: 9,
          components: [{
            type: 10,
            content:
              `## ${app.emoji} Αίτηση — ${app.label}\n` +
              `> 👤 **Αιτών:** <@${user.id}> \`(${user.tag})\`\n` +
              `> 🆔 **User ID:** \`${user.id}\`` +
              verdictLine,
          }],
          accessory: { type: 11, media: { url: user.displayAvatarURL({ extension: "png", size: 256 }) } },
        },
        { type: 14, divider: true, spacing: 1 },
        ...answerBlocks,
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `## ${verdictEmoji} ${verdictText}\n-# Αξιολογήθηκε από ${reviewerTag} • <t:${stamp}:F>` },
      ],
    }],
  };
}

function buildStaffAcceptLogPayload(typeKey, applicantId, reviewerTag, roleId) {
  const app   = STAFF_APP_TYPES[typeKey];
  const stamp = nowTs();
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0x57F287,
      components: [{
        type: 10,
        content:
          `## ✅ Αίτηση Εγκρίθηκε — ${app.emoji} ${app.label}\n` +
          `> 👤 **Αιτών:** <@${applicantId}>\n` +
          `> 🛡️ **Εγκρίθηκε από:** ${reviewerTag}\n` +
          `> 🏷️ **Ρόλος:** <@&${roleId}> ανατέθηκε\n` +
          `> ⏰ <t:${stamp}:F>`,
      }],
    }],
  };
}

function buildStaffRejectLogPayload(typeKey, applicantId, reviewerTag) {
  const app   = STAFF_APP_TYPES[typeKey];
  const stamp = nowTs();
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xED4245,
      components: [{
        type: 10,
        content:
          `## ❌ Αίτηση Απορρίφθηκε — ${app.emoji} ${app.label}\n` +
          `> 👤 **Αιτών:** <@${applicantId}>\n` +
          `> 🛡️ **Απορρίφθηκε από:** ${reviewerTag}\n` +
          `> ⏰ <t:${stamp}:F>`,
      }],
    }],
  };
}

function buildStaffAcceptDmPayload(typeKey) {
  const app = STAFF_APP_TYPES[typeKey];
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0x57F287,
      components: [{
        type: 10,
        content:
          `## 🎉 Συγχαρητήρια!\n` +
          `Η αίτησή σου για **${app.emoji} ${app.label}** στο **Apex Roleplay** εγκρίθηκε!\n\n` +
          `Ο ρόλος σου έχει ανατεθεί. Καλωσήρθες στην ομάδα!`,
      }],
    }],
  };
}

function buildStaffRejectDmPayload(typeKey) {
  const app = STAFF_APP_TYPES[typeKey];
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xED4245,
      components: [{
        type: 10,
        content:
          `## ❌ Αίτηση Απορρίφθηκε\n` +
          `Η αίτησή σου για **${app.emoji} ${app.label}** στο **Apex Roleplay** δεν εγκρίθηκε.\n\n` +
          `Μπορείς να ξαναπροσπαθήσεις στο μέλλον. Καλή συνέχεια! 🎮`,
      }],
    }],
  };
}

function buildStaffAcceptAnnouncementPayload(typeKey, user, reviewerTag) {
  const app   = STAFF_APP_TYPES[typeKey];
  const stamp = nowTs();
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xf5c518,
      components: [
        {
          type: 9,
          components: [{
            type: 10,
            content:
              `## <:logo:1472649971013783685> ΑΙΤΗΣΗ — ${app.emoji} ${app.label}\n` +
              `> **Χρήστης:** <@${user.id}>\n` +
              `> **Θέση:** ${app.label}\n` +
              `> **Εγκρίθηκε από:** ${reviewerTag}\n` +
              `> <t:${stamp}:F>\n\n` +
              `Καλωσήρθες στην ομάδα!`,
          }],
          accessory: { type: 11, media: { url: SERVER_LOGO } },
        },
        { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${stamp}:F>` },
      ],
    }],
  };
}

// Build staff app modal — prefixed "staffmodal_" to avoid clash with crim modals
function buildStaffModal(typeKey) {
  const app       = STAFF_APP_TYPES[typeKey];
  const questions = STAFF_APP_MODALS[typeKey];
  const modal     = new ModalBuilder()
    .setCustomId(`staffmodal_${typeKey}`)
    .setTitle(`Αίτηση ${app.label}`);
  for (const q of questions) {
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(q.id)
          .setLabel(q.label)
          .setStyle(q.style)
          .setRequired(true)
          .setPlaceholder(q.placeholder)
      )
    );
  }
  return modal;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CRIMINAL APP — COMPONENT V2 BUILDERS
// ══════════════════════════════════════════════════════════════════════════════
function cv2_MainPanel() {
  const stamp = nowTs();

  const CRIM_TYPES = [
    {
      key:         "mafia",
      emoji:       "🕵️",
      label:       "Mafia",
      description: "Γίνε μέλος σε μια από τις πιο ισχυρές οργανώσεις του κόσμου και ανέβα στην ιεραρχία!",
    },
    {
      key:         "cartel",
      emoji:       "🦅",
      label:       "Cartel",
      description: "Έλεγξε τα ναρκωτικά και τα όπλα. Η εξουσία σου δεν γνωρίζει σύνορα!",
    },
    {
      key:         "gang",
      emoji:       "🔫",
      label:       "Gang",
      description: "Κατάλαβε τους δρόμους και κράτα το hood σου κάτω από τον έλεγχό σου!",
    },
  ];

  // Build sections array: for each type one section (text left, button right as accessory)
  const sections = CRIM_TYPES.map((t) => ({
    type: 9, // Section
    components: [
      {
        type:    10, // TextDisplay
        content: `### ${t.emoji} ${t.label}\n${t.description}`,
      },
    ],
    accessory: {
      type:      2, // Button
      style:     ButtonStyle.Secondary,
      label:     t.label,
      emoji:     { name: t.emoji },
      custom_id: `crimapply_${t.key}`,
    },
  }));

  const components = [
    // Header
    {
      type:    10,
      content: `## <:logo:1472649971013783685> Warzone Roleplay | Criminal Job Application\n`,
    },
    // Banner image
    {
      type:  12,
      items: [{ media: { url: CRIM_CONFIG.BANNER_URL } }],
    },
    { type: 14, divider: true, spacing: 1 },
  ];

  // Interleave sections with dividers
  for (let i = 0; i < sections.length; i++) {
    components.push(sections[i]);
    if (i < sections.length - 1) components.push({ type: 14, divider: true, spacing: 1 });
  }

  // Footer timestamp
  components.push({ type: 10, content: `-# <:logo:1472649971013783685> Warzone Roleplay™ • <t:${stamp}:F>` });

  return {
    flags:      MessageFlags.IsComponentsV2,
    components: [{ type: 17, accent_color: CRIM_CONFIG.C_GOLD, components }],
  };
}

function cv2_InfoEmbed() {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GOLD);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "## 🔫 Warzone Roleplay | Criminal Jobs\n\n" +
      "Για να πάρετε κάποιο **Criminal Job** θα πρέπει να ανοίξετε ένα ticket στο " +
      "**#get-a-criminaljob** και να συμπληρώσετε τη φόρμα που θα σας ζητηθεί. " +
      "Έπειτα ο αρμόδιος θα επικοινωνήσει μαζί σας και θα προχωρήσετε στις " +
      "περαιτέρω λεπτομέρειες. 🤝"
    )
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "🚨 **Προσοχή:** Όποιο Criminal Job έχει δίπλα του το **« 🟢 »** είναι **Available**, " +
      "όποιο Criminal Job έχει δίπλα του το **« 🔴 »** είναι **Unavailable**, " +
      "επιλέξτε με προσοχή!"
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function cv2_TeamsEmbed() {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GOLD);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent("# 🗂️ Warzone Roleplay | WZ"));
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🕵️ Available Mafias\n" + teamsList(CRIM_CONFIG.teams.mafias))
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🦅 Available Cartels\n" + teamsList(CRIM_CONFIG.teams.cartels))
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🔫 Available Gangs\n" + teamsList(CRIM_CONFIG.teams.gangs))
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "-# 🟢 = Available  |  🔴 = Unavailable — Τα 🔴 jobs δεν δέχονται αιτήσεις αυτή τη στιγμή."
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function cv2_TeamsPanel() {
  const base   = cv2_TeamsEmbed();
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("crim_back_panel").setLabel("← Πίσω στο Panel").setStyle(ButtonStyle.Secondary)
  );
  return { components: [...base.components, backRow], flags: MessageFlags.IsComponentsV2 };
}

function cv2_ReviewMsg(appId, user, typeLabel, answers) {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_ORANGE);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`<@&${CRIM_CONFIG.REVIEWER_ROLE_ID}> — Νέα αίτηση!`)
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 📋 Νέα Αίτηση Criminal Job\n` +
      `-# ID: \`${appId}\`  |  Τύπος: **${typeLabel}**\n\n` +
      `👤 **Αιτών:** ${user.tag} (<@${user.id}>)\n` +
      `📅 **Ημερομηνία:** <t:${nowTs()}:F>`
    )
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🔗 Discord Server Link:**\n> ${answers.discordLink}\n\n` +
      `**🏴‍☠️ Criminal Job Name & Type:**\n> ${answers.jobName}\n\n` +
      `**👥 Team Members Age (Average):**\n> ${answers.avgAge}\n\n` +
      `**🔢 Team Members (Number):**\n> ${answers.memberCount}\n\n` +
      `**⏰ Daily Activity In-Game (Hours):**\n> ${answers.dailyHours}`
    )
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# 🛡️ Μόνο το <@&${CRIM_CONFIG.REVIEWER_ROLE_ID}> μπορεί να αποδεχτεί ή να απορρίψει αυτή την αίτηση.`
    )
  );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`crimaccept_${appId}`).setLabel("✅ Accept").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`crimreject_${appId}`).setLabel("❌ Reject").setStyle(ButtonStyle.Danger),
  );
  return { components: [c, row], flags: MessageFlags.IsComponentsV2 };
}

function cv2_ReviewDone(appId, typeLabel, userId, staffUser, accepted) {
  const color = accepted ? CRIM_CONFIG.C_GREEN : CRIM_CONFIG.C_RED;
  const title = accepted ? "## ✅ ΑΠΟΔΕΚΤΗ" : "## ❌ ΑΠΟΡΡΙΦΘΗΚΕ";
  const verb  = accepted ? "Αποδέχτηκε" : "Απέρριψε";
  const c     = new ContainerBuilder().setAccentColor(color);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${title} | ${typeLabel}\n` +
      `-# ID: \`${appId}\`\n\n` +
      `👤 **Αιτών:** <@${userId}>\n` +
      `🛡️ **${verb}:** ${staffUser.tag}\n` +
      `📅 <t:${nowTs()}:F>`
    )
  );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("crimdone_a").setLabel("✅ Accept").setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId("crimdone_r").setLabel("❌ Reject").setStyle(ButtonStyle.Danger).setDisabled(true),
  );
  return { components: [c, row], flags: MessageFlags.IsComponentsV2 };
}

function cv2_PrivateWelcome(appId, userId, typeLabel, answers) {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GREEN);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`<@${userId}> <@&${CRIM_CONFIG.REVIEWER_ROLE_ID}>`)
  );
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ✅ Αίτηση Εγκρίθηκε | ${typeLabel}\n` +
      `-# ID: \`${appId}\`\n\n` +
      `👤 **Αιτών:** <@${userId}>\n` +
      `📅 <t:${nowTs()}:F>\n\n` +
      `**🔗 Discord Server Link:**\n> ${answers.discordLink}\n\n` +
      `**🏴‍☠️ Criminal Job:**\n> ${answers.jobName}\n\n` +
      `**👥 Μέσος Ηλικίας Μελών:**\n> ${answers.avgAge}\n\n` +
      `**🔢 Αριθμός Μελών:**\n> ${answers.memberCount}\n\n` +
      `**⏰ Ώρες Ημερησίως:**\n> ${answers.dailyHours}`
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function cv2_DmAccepted(appId, typeLabel, channelName) {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GREEN);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ✅ Η αίτησή σου έγινε **Αποδεκτή**!\n\n` +
      `**Server:** Warzone Roleplay\n` +
      `**Τύπος:** ${typeLabel}\n` +
      `**ID:** \`${appId}\`\n\n` +
      `Δημιουργήθηκε ιδιωτικό κανάλι για εσένα: **#${channelName}**\n` +
      `Εκεί θα επικοινωνήσεις με τον αρμόδιο για τα επόμενα βήματα. 🤝\n\n` +
      `-# Warzone Roleplay | Criminal Jobs System`
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function cv2_DmRejected(appId, typeLabel) {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_RED);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ❌ Η αίτησή σου **Απορρίφθηκε**\n\n` +
      `**Server:** Warzone Roleplay\n` +
      `**Τύπος:** ${typeLabel}\n` +
      `**ID:** \`${appId}\`\n\n` +
      `Δυστυχώς η αίτησή σου δεν εγκρίθηκε αυτή τη φορά.\n` +
      `Επικοινώνησε με το staff για περισσότερες πληροφορίες.\n\n` +
      `-# Warzone Roleplay | Criminal Jobs System`
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function cv2_AppSubmitted(appId, typeLabel) {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GREEN);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ✅ Η αίτησή σου υποβλήθηκε!\n\n` +
      `**Τύπος:** ${typeLabel}\n` +
      `**ID Αίτησης:** \`${appId}\`\n\n` +
      `Ο αρμόδιος θα αξιολογήσει την αίτησή σου.\n` +
      `Θα λάβεις **DM** με την απάντηση. 🤝\n\n` +
      `-# Warzone Roleplay | Criminal Jobs System`
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral };
}

function cv2_NoPermission() {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_RED);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 🚫 Δεν έχεις δικαίωμα!\n\n` +
      `Δεν μπορείς να πειράξεις αυτή την αίτηση.\n` +
      `Μόνο το <@&${CRIM_CONFIG.REVIEWER_ROLE_ID}> έχει δικαίωμα να κάνει **Accept** ή **Reject**.\n\n` +
      `-# Warzone Roleplay | Criminal Jobs System`
    )
  );
  return { components: [c] };
}

function cv2_AlreadyHandled() {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_RED);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ⚠️ Η αίτηση έχει ήδη αξιολογηθεί!\n\n` +
      `Αυτή η αίτηση δεν βρέθηκε στο σύστημα.\n` +
      `Πιθανόν να έχει ήδη γίνει Accept ή Reject.\n\n` +
      `-# Warzone Roleplay | Criminal Jobs System`
    )
  );
  return { components: [c] };
}

function cv2_TeamStatus() {
  const c = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_GOLD);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent("# 📊 Team Status (Admin View)"));
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "**🕵️ Mafias:**\n" + teamsList(CRIM_CONFIG.teams.mafias) + "\n\n" +
      "**🦅 Cartels:**\n" + teamsList(CRIM_CONFIG.teams.cartels) + "\n\n" +
      "**🔫 Gangs:**\n" + teamsList(CRIM_CONFIG.teams.gangs) + "\n\n" +
      "-# Χρησιμοποίησε `!toggleteam <name>` για να αλλάξεις status."
    )
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// Criminal apps modal — prefixed "crimmodal_" to avoid clash with staff modals
function buildCrimModal(type) {
  const label = { mafia: "Mafia", cartel: "Cartel", gang: "Gang" }[type];
  return new ModalBuilder()
    .setCustomId(`crimmodal_${type}`)
    .setTitle(`${label} Application | Warzone RP`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("discordLink").setLabel("Discord Server Link (Permanent)").setStyle(TextInputStyle.Short).setPlaceholder("https://discord.gg/...").setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("jobName").setLabel("Criminal Job Name & Type").setStyle(TextInputStyle.Short).setPlaceholder("Cartel / Mafia / Gang").setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("avgAge").setLabel("Team Members Age (Average)").setStyle(TextInputStyle.Short).setPlaceholder("π.χ. 18").setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("memberCount").setLabel("Team Members (Number)").setStyle(TextInputStyle.Short).setPlaceholder("π.χ. 10").setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("dailyHours").setLabel("Daily Activity In-Game (Hours)").setStyle(TextInputStyle.Short).setPlaceholder("π.χ. 4").setRequired(true)
      ),
    );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MESSAGE CREATE — ticket logger
// ══════════════════════════════════════════════════════════════════════════════
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!ticketMessages.has(message.channelId)) return;
  ticketMessages.get(message.channelId).push({
    type:      "user",
    author:    message.author.tag,
    authorId:  message.author.id,
    roles:     message.member?.roles.cache.map((r) => r.id) ?? [],
    content:   message.content || "[attachment / embed only]",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  MESSAGE CREATE — prefix commands (single handler)
// ══════════════════════════════════════════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd  = args.shift().toLowerCase();
  const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);

  // ── !ticket_menu ──────────────────────────────────────────────────────────
  if (cmd === "ticket_menu") {
    if (!isAdmin) return;
    try {
      await message.channel.send(buildTicketMenuPayload());
      await message.delete().catch(() => {});
    } catch (err) {
      console.error("ticket_menu error:", err);
      await message.reply(`❌ Failed: ${err.message}`);
    }
    return;
  }

  // ── !applications ─────────────────────────────────────────────────────────
  if (cmd === "applications") {
    if (!isAdmin) return;
    try {
      await message.channel.send(buildApplicationsPanelPayload());
      await message.delete().catch(() => {});
    } catch (err) {
      console.error("!applications error:", err);
      await message.reply(`❌ Failed: ${err.message}`).catch(() => {});
    }
    return;
  }

  // ── !crimapps ─────────────────────────────────────────────────────────────
  if (cmd === "crimapps") {
    if (!message.guild) return;
    await message.delete().catch(() => {});
    await message.channel.send(cv2_MainPanel());
    return;
  }

  // ── !logs-setup ───────────────────────────────────────────────────────────
  if (cmd === "logs-setup") {
    if (!message.guild) return;
    if (!isAdmin) {
      return message.reply("❌ You need **Administrator** permissions to run this command.");
    }
    await message.reply("⚙️ Setting up log channels, please wait...");
    const guild  = message.guild;
    const config = loadLogConfig();
    if (!config[guild.id]) config[guild.id] = {};

    let category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === "logs"
    );
    if (!category) {
      category = await guild.channels.create({
        name: "Logs",
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: guild.members.me, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
      });
    }

    const results = [];
    for (const [key, channelName] of Object.entries(LOG_CHANNELS)) {
      let existing = guild.channels.cache.find(
        (c) => c.name === channelName && c.parentId === category.id
      );
      if (!existing) {
        existing = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: guild.members.me, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          ],
        });
      }
      config[guild.id][key] = existing.id;
      results.push(`✅ \`${channelName}\` → <#${existing.id}>`);
    }

    saveLogConfig(config);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Log Channels Setup Complete")
      .setThumbnail(THUMBNAIL_LOGO)
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
      .setDescription(results.join("\n"))
      .setFooter({ text: `${guild.name} - Logs Setup`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
    return;
  }

  // ── !setinfochannel <id> ──────────────────────────────────────────────────
  if (cmd === "setinfochannel") {
    if (!isAdmin) {
      return message.reply("❌ Χρειάζεσαι **Administrator** permissions.")
        .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    const chId = args[0];
    if (!chId) return message.reply("❌ Χρήση: `!setinfochannel <channelId>`");
    const targetCh = message.guild?.channels.cache.get(chId);
    if (!targetCh || targetCh.type !== ChannelType.GuildText) {
      return message.reply("❌ Δεν βρέθηκε text κανάλι με αυτό το ID.");
    }
    try {
      const fetched  = await targetCh.messages.fetch({ limit: 100 });
      const botMsgs  = fetched.filter((m) => m.author.id === client.user.id);
      const recent   = botMsgs.filter((m) => Date.now() - m.createdTimestamp < 12 * 24 * 60 * 60 * 1000);
      const old      = botMsgs.filter((m) => Date.now() - m.createdTimestamp >= 12 * 24 * 60 * 60 * 1000);
      if (recent.size > 0) await targetCh.bulkDelete(recent).catch(() => {});
      for (const [, m] of old) await m.delete().catch(() => {});
    } catch (err) {
      console.error("[setinfochannel]", err.message);
    }
    await targetCh.send(cv2_InfoEmbed());
    await targetCh.send(cv2_TeamsEmbed());
    await message.reply(`✅ Εστάλησαν τα embeds στο ${targetCh}!`)
      .then((m) => setTimeout(() => m.delete().catch(() => {}), 6000));
    return;
  }

  // ── !toggleteam <name> ────────────────────────────────────────────────────
  if (cmd === "toggleteam") {
    if (!isAdmin) return message.reply("❌ Χρειάζεσαι **Administrator** permissions.");
    const name = args.join(" ");
    if (!name) return message.reply("❌ Χρήση: `!toggleteam <team name>`\nΠαράδειγμα: `!toggleteam Yakuza`");
    const found = findTeam(name);
    if (!found) return message.reply(`❌ Δεν βρέθηκε team: **${name}**\nΧρησιμοποίησε \`!teamstatus\` για λίστα.`);
    const team = CRIM_CONFIG.teams[found.cat][found.idx];
    team.available = !team.available;
    await message.reply(`✅ **${team.emoji} ${team.name}** → ${team.available ? "🟢 Available" : "🔴 Unavailable"}`);
    return;
  }

  // ── !teamstatus ───────────────────────────────────────────────────────────
  if (cmd === "teamstatus") {
    if (!isAdmin) return message.reply("❌ Χρειάζεσαι **Administrator** permissions.");
    await message.reply(cv2_TeamStatus());
    return;
  }

  // ── Command log helper (scoped inside handler so it can access `message`) ──
  async function logCommand(guild, executor, cmdName, target, detail) {
    const logCh = getLogChannel(guild.id, "command");
    if (!logCh) return;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🔧 Command Used")
      .setThumbnail(THUMBNAIL_LOGO)
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
      .addFields(
        { name: "👤 Executor",  value: `<@${executor.id}> \`(${executor.tag})\``, inline: false },
        { name: "⚙️ Command",   value: `\`!${cmdName}\``,                         inline: true  },
        { name: "📌 Channel",   value: `<#${message.channelId}>`,                 inline: true  },
        ...(target ? [{ name: "🎯 Target",  value: target, inline: false }] : []),
        ...(detail ? [{ name: "📝 Detail",  value: detail, inline: false }] : []),
        { name: "🕐 Time",      value: ts(),                                       inline: false },
      )
      .setFooter({ text: `${guild.name} - Command Logs`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
      .setTimestamp();
    await logCh.send({ embeds: [embed] }).catch(() => {});
  }

  // ── !say <message> ────────────────────────────────────────────────────────
  // Plain Component V2 announcement — gold accent, just text
  if (cmd === "say") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const text = args.join(" ");
    if (!text) return message.reply("❌ Usage: `!say <message>`");
    await message.delete().catch(() => {});
    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0xf5c518,
        components: [{ type: 10, content: text }],
      }],
    });
    await logCommand(message.guild, message.author, "say", null, text.slice(0, 512));
    return;
  }

  // ── !say2 <title> | <description> ────────────────────────────────────────
  // Component V2: bold heading + divider + body + timestamp footer
  if (cmd === "say2") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const full = args.join(" ");
    if (!full.includes("|")) return message.reply("❌ Usage: `!say2 <title> | <description>`");
    const splitIdx = full.indexOf("|");
    const title    = full.slice(0, splitIdx).trim();
    const body     = full.slice(splitIdx + 1).trim();
    if (!title || !body) return message.reply("❌ Both title and description are required.");
    await message.delete().catch(() => {});
    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0xf5c518,
        components: [
          { type: 10, content: `## ${title}` },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: body },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>` },
        ],
      }],
    });
    await logCommand(message.guild, message.author, "say2", null, `**${title}** | ${body.slice(0, 400)}`);
    return;
  }

  // ── !say3 <title> | <description> ────────────────────────────────────────
  // Component V2: logo heading + banner image + divider + body + divider + footer
  if (cmd === "say3") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const full = args.join(" ");
    if (!full.includes("|")) return message.reply("❌ Usage: `!say3 <title> | <description>`");
    const splitIdx = full.indexOf("|");
    const title    = full.slice(0, splitIdx).trim();
    const body     = full.slice(splitIdx + 1).trim();
    if (!title || !body) return message.reply("❌ Both title and description are required.");
    await message.delete().catch(() => {});
    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0xf5c518,
        components: [
          { type: 10, content: `## <:logo:1472649971013783685> ${title}` },
          { type: 12, items: [{ media: { url: SERVER_BANNER } }] },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: body },
          { type: 14, divider: true, spacing: 0 },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>` },
        ],
      }],
    });
    await logCommand(message.guild, message.author, "say3", null, `**${title}** | ${body.slice(0, 400)}`);
    return;
  }

  // ── !clear <amount> ───────────────────────────────────────────────────────
  if (cmd === "clear") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("❌ Usage: `!clear <1-100>`");
    await message.delete().catch(() => {});
    let deleted;
    try {
      deleted = await message.channel.bulkDelete(amount, true);
    } catch {
      return message.channel.send("❌ Cannot delete messages older than 14 days.")
        .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // Command log
    await logCommand(message.guild, message.author, "clear", null,
      `Deleted **${deleted.size}** message(s) in <#${message.channelId}> \`(${message.channelId})\``);

    // Dedicated clear log
    const clearCh = getLogChannel(message.guild.id, "clear");
    if (clearCh) {
      const embed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle("🧹 Messages Cleared")
        .setThumbnail(THUMBNAIL_LOGO)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) || undefined })
        .addFields(
          { name: "👤 Executor",  value: `<@${message.author.id}> \`(${message.author.tag})\``,         inline: false },
          { name: "📌 Channel",   value: `<#${message.channelId}> \`(${message.channelId})\``,           inline: false },
          { name: "🗑️ Deleted",   value: `${deleted.size} message(s) (requested: ${amount})`,            inline: true  },
          { name: "🕐 Time",      value: ts(),                                                            inline: true  },
        )
        .setFooter({ text: `${message.guild.name} - Clear Logs`, iconURL: message.guild.iconURL({ dynamic: true }) || undefined })
        .setTimestamp();
      await clearCh.send({ embeds: [embed] }).catch(() => {});
    }

    const confirm = await message.channel.send(`✅ Deleted **${deleted.size}** message(s).`);
    setTimeout(() => confirm.delete().catch(() => {}), 4000);
    return;
  }

  // ── !lock [reason] ────────────────────────────────────────────────────────
  if (cmd === "lock") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const reason = args.join(" ") || "No reason provided";
    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false, AddReactions: false },
        { reason: `Locked by ${message.author.tag}: ${reason}` }
      );
    } catch {
      return message.reply("❌ Failed to lock channel — check my permissions.");
    }
    await message.delete().catch(() => {});
    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0xED4245,
        components: [{
          type: 10,
          content:
            `## 🔒 Channel Locked
` +
            `> 📌 **Channel:** <#${message.channelId}>
` +
            `> 👤 **Locked by:** <@${message.author.id}>
` +
            `> 📝 **Reason:** ${reason}
` +
            `> ⏰ <t:${nowTs()}:F>`,
        }],
      }],
    });
    await logCommand(message.guild, message.author, "lock", `<#${message.channelId}> \`(${message.channelId})\``, reason);
    return;
  }

  // ── !unlock [reason] ──────────────────────────────────────────────────────
  if (cmd === "unlock") {
    if (!isStaff(message.member) && !isAdmin) return message.reply("❌ You need **Staff** permissions.");
    const reason = args.join(" ") || "No reason provided";
    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: null, AddReactions: null },
        { reason: `Unlocked by ${message.author.tag}: ${reason}` }
      );
    } catch {
      return message.reply("❌ Failed to unlock channel — check my permissions.");
    }
    await message.delete().catch(() => {});
    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0x57F287,
        components: [{
          type: 10,
          content:
            `## 🔓 Channel Unlocked
` +
            `> 📌 **Channel:** <#${message.channelId}>
` +
            `> 👤 **Unlocked by:** <@${message.author.id}>
` +
            `> 📝 **Reason:** ${reason}
` +
            `> ⏰ <t:${nowTs()}:F>`,
        }],
      }],
    });
    await logCommand(message.guild, message.author, "unlock", `<#${message.channelId}> \`(${message.channelId})\``, reason);
    return;
  }

  // ── !nuke ─────────────────────────────────────────────────────────────────
  // Deletes and recreates the channel with exactly the same settings + position
  if (cmd === "nuke") {
    if (!isAdmin) return message.reply("❌ You need **Administrator** permissions.");
    const channel = message.channel;
    const guild   = message.guild;

    // Snapshot everything before deletion
    const snap = {
      name:             channel.name,
      topic:            channel.topic,
      nsfw:             channel.nsfw,
      rateLimitPerUser: channel.rateLimitPerUser,
      position:         channel.position,
      parentId:         channel.parentId,
      type:             channel.type,
      permissionOverwrites: channel.permissionOverwrites.cache.map((po) => ({
        id:    po.id,
        type:  po.type,
        allow: po.allow.toArray(),
        deny:  po.deny.toArray(),
      })),
    };

    await logCommand(guild, message.author, "nuke",
      `#${snap.name} \`(${channel.id})\``,
      "Channel deleted and recreated with identical settings");

    await channel.delete("Nuke command").catch(() => {});

    const newCh = await guild.channels.create({
      name:             snap.name,
      topic:            snap.topic   || undefined,
      nsfw:             snap.nsfw,
      rateLimitPerUser: snap.rateLimitPerUser,
      type:             snap.type,
      parent:           snap.parentId || undefined,
      permissionOverwrites: snap.permissionOverwrites,
    }).catch(() => null);

    if (!newCh) return;

    await newCh.setPosition(snap.position).catch(() => {});

    await newCh.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17,
        accent_color: 0xED4245,
        components: [
          { type: 12, items: [{ media: { url: SERVER_BANNER } }] },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 10,
            content:
              `## 💥 Channel Nuked
` +
              `> This channel was nuked by <@${message.author.id}>.
` +
              `> ⏰ <t:${nowTs()}:F>`,
          },
          { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>` },
        ],
      }],
    });
    return;
  }

  // ── !dmall <message> ──────────────────────────────────────────────────────
  // Sends a Component V2 DM to every non-bot member
  if (cmd === "dmall") {
    if (!isAdmin) return message.reply("❌ You need **Administrator** permissions.");
    const text = args.join(" ");
    if (!text) return message.reply("❌ Usage: `!dmall <message>`");
    await message.delete().catch(() => {});
    const statusMsg = await message.channel.send("📨 Sending DMs, please wait...");

    const members = await message.guild.members.fetch().catch(() => null);
    if (!members) return statusMsg.edit("❌ Failed to fetch members.");

    let sent = 0, failed = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send({
          flags: MessageFlags.IsComponentsV2,
          components: [{
            type: 17,
            accent_color: 0xf5c518,
            components: [
              {
                type: 10,
                content:
                  `## 📢 Message from **${message.guild.name}**
` +
                  `> ${text}
` +
                  `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>`,
              },
            ],
          }],
        });
        sent++;
      } catch { failed++; }
      await new Promise((r) => setTimeout(r, 300));
    }

    await statusMsg.edit(`✅ DMall done — **${sent}** delivered, **${failed}** failed (DMs closed).`);
    setTimeout(() => statusMsg.delete().catch(() => {}), 8000);
    await logCommand(message.guild, message.author, "dmall", `${sent} members`, text.slice(0, 512));
    return;
  }

  // ── !dmall2 <title> | <description> ──────────────────────────────────────
  // Sends a rich Component V2 embed DM to every non-bot member
  if (cmd === "dmall2") {
    if (!isAdmin) return message.reply("❌ You need **Administrator** permissions.");
    const full = args.join(" ");
    if (!full.includes("|")) return message.reply("❌ Usage: `!dmall2 <title> | <description>`");
    const splitIdx = full.indexOf("|");
    const title    = full.slice(0, splitIdx).trim();
    const body     = full.slice(splitIdx + 1).trim();
    if (!title || !body) return message.reply("❌ Both title and description are required.");
    await message.delete().catch(() => {});
    const statusMsg = await message.channel.send("📨 Sending DMs, please wait...");

    const members = await message.guild.members.fetch().catch(() => null);
    if (!members) return statusMsg.edit("❌ Failed to fetch members.");

    const guildIcon = message.guild.iconURL({ extension: "png", size: 256 }) || SERVER_LOGO;
    let sent = 0, failed = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send({
          flags: MessageFlags.IsComponentsV2,
          components: [{
            type: 17,
            accent_color: 0xf5c518,
            components: [
              { type: 10, content: `## 📢 ${title}` },
              { type: 12, items: [{ media: { url: guildIcon } }] },
              { type: 14, divider: true, spacing: 1 },
              { type: 10, content: body },
              { type: 14, divider: true, spacing: 0 },
              { type: 10, content: `-# 📨 Sent from **${message.guild.name}** • <t:${nowTs()}:F>` },
            ],
          }],
        });
        sent++;
      } catch { failed++; }
      await new Promise((r) => setTimeout(r, 300));
    }

    await statusMsg.edit(`✅ DMall2 done — **${sent}** delivered, **${failed}** failed (DMs closed).`);
    setTimeout(() => statusMsg.delete().catch(() => {}), 8000);
    await logCommand(message.guild, message.author, "dmall2", `${sent} members`, `**${title}** | ${body.slice(0, 400)}`);
    return;
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SINGLE UNIFIED INTERACTION HANDLER
// ══════════════════════════════════════════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {
  try {

    // ══════════════════════════════════════════════════════════════════════════
    //  STRING SELECT MENUS
    // ══════════════════════════════════════════════════════════════════════════
    if (interaction.isStringSelectMenu()) {

      // ── Duty dropdown ─────────────────────────────────────────────────────
      if (interaction.customId === "duty_select") {
        const value = interaction.values[0];
        if (value === "on_duty")     { await handleOnDuty(interaction);         return; }
        if (value === "off_duty")    { await handleOffDuty(interaction);        return; }
        if (value === "leaderboard") { await handleDutyLeaderboard(interaction); return; }
        return;
      }

      // ── Ticket dropdown ───────────────────────────────────────────────────
      if (interaction.customId === "ticket_select") {
        const typeKey = interaction.values[0];
        const guild   = interaction.guild;
        const t       = TICKET_TYPES[typeKey];

        if (!t) return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Unknown ticket type." });

        if (activeTickets.has(interaction.user.id)) {
          return interaction.reply({
            flags:   MessageFlags.Ephemeral,
            content: "❌ Έχετε ήδη ένα ενεργό ticket. Κλείστε το πρώτα πριν ανοίξετε νέο.",
          });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const ticketId = generateTicketId();
        const category = await ensureCategory(guild, t.categoryName);

        const overwrites = [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
            ],
          },
        ];
        for (const roleId of t.roles) {
          if (guild.roles.cache.has(roleId)) {
            overwrites.push({
              id: roleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ManageMessages,
              ],
            });
          }
        }

        const emoji        = t.emoji?.name || "🎫";
        const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const channelName   = `${emoji}-ticket-${cleanUsername}`.slice(0, 100);

        const ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: overwrites,
        });

        const now = new Date().toISOString().replace("T", " ").slice(0, 19);

        activeTickets.set(interaction.user.id, {
          channelId:   ticketChannel.id,
          channelName: ticketChannel.name,
          ticketId,
          typeKey,
          category:    t.label,
          creator:     interaction.user.tag,
          creatorId:   interaction.user.id,
          createdAt:   now,
        });

        ticketMessages.set(ticketChannel.id, [
          { type: "system", content: `Ticket ${ticketId} created by ${interaction.user.tag}`, timestamp: now },
        ]);

        const roleMentions = t.roles
          .map((id) => guild.roles.cache.get(id))
          .filter(Boolean)
          .map((r) => `<@&${r.id}>`);

        await ticketChannel.send(buildTicketOpenPayload(interaction.user, typeKey, ticketId, roleMentions));

        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
          await logChannel.send(
            buildLogOpenPayload(interaction.user, typeKey, ticketId, ticketChannel, roleMentions)
          ).catch(console.error);
        }

        await interaction.editReply(buildTicketCreatedEphemeral(typeKey, ticketChannel));
        return;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  BUTTONS
    // ══════════════════════════════════════════════════════════════════════════
    if (interaction.isButton()) {
      const { customId } = interaction;

      // ── Ticket: Close ─────────────────────────────────────────────────────
      if (customId.startsWith("close_ticket_")) {
        const ticketId = customId.replace("close_ticket_", "");

        let userId = null, ticketData = null;
        for (const [uid, data] of activeTickets) {
          if (data.channelId === interaction.channelId) { userId = uid; ticketData = data; break; }
        }

        if (!ticketData) {
          return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Ticket data not found!" });
        }

        await interaction.deferReply();

        const closedAt         = new Date().toISOString().replace("T", " ").slice(0, 19);
        ticketData.closedAt    = closedAt;
        ticketData.closedBy    = interaction.user.tag;
        ticketData.channelName = interaction.channel.name;

        const messages = ticketMessages.get(interaction.channelId) ?? [];
        messages.push({ type: "system", content: `Ticket closed by ${interaction.user.tag}`, timestamp: closedAt });

        const htmlContent    = generateHtmlTranscript(ticketId, ticketData, messages);
        const transcriptDir  = path.join(__dirname, "transcripts");
        fs.mkdirSync(transcriptDir, { recursive: true });
        const transcriptPath = path.join(transcriptDir, `ticket_${ticketId}.html`);
        fs.writeFileSync(transcriptPath, htmlContent, "utf8");

        const transcriptAttachment = new AttachmentBuilder(transcriptPath, { name: `transcript_${ticketId}.html` });

        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
          await logChannel.send(buildLogClosePayload(ticketId, ticketData, messages.length)).catch(console.error);
          await logChannel.send({
            content: `📎 **Transcript** for ticket \`${ticketId}\` — \`${ticketData.channelName}\``,
            files:   [transcriptAttachment],
          }).catch(console.error);
        }

        if (userId) activeTickets.delete(userId);
        ticketMessages.delete(interaction.channelId);
        claimedTickets.delete(interaction.channelId);

        await interaction.editReply({
          content: "🔒 **Το Ticket κλείνει σε 5 δευτερόλεπτα...**\n📝 Transcript αποθηκεύτηκε και στάλθηκε.",
        });

        await new Promise((r) => setTimeout(r, 5000));
        await interaction.channel.delete().catch(console.error);
        return;
      }

      // ── Ticket: Claim ─────────────────────────────────────────────────────
      if (customId.startsWith("claim_ticket_")) {
        if (!isStaff(interaction.member)) {
          return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Μόνο το staff μπορεί να κάνει claim ένα ticket." });
        }
        const alreadyClaimed = claimedTickets.get(interaction.channelId);
        if (alreadyClaimed) {
          return interaction.reply({
            flags:   MessageFlags.Ephemeral,
            content: `❌ Αυτό το ticket έχει ήδη claimed από **${alreadyClaimed.tag}**.`,
          });
        }
        claimedTickets.set(interaction.channelId, { userId: interaction.user.id, tag: interaction.user.tag });
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [{
            type: 17, accent_color: 0x22c55e,
            components: [{ type: 10, content: `## 🤝 Ticket Claimed\n<@${interaction.user.id}> ανέλαβε αυτό το ticket. Θα σας εξυπηρετήσει σύντομα!` }],
          }],
        });
        return;
      }

      // ── Ticket: Ping ──────────────────────────────────────────────────────
      if (customId.startsWith("ping_ticket_")) {
        if (!isStaff(interaction.member)) {
          return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Μόνο το staff μπορεί να κάνει ping τον user." });
        }
        let ticketData = null;
        for (const data of activeTickets.values()) {
          if (data.channelId === interaction.channelId) { ticketData = data; break; }
        }
        if (!ticketData) {
          return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Ticket data not found." });
        }
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [{
            type: 17, accent_color: 0xf59e0b,
            components: [{ type: 10, content: `## 🔔 User Ping\n<@${ticketData.creatorId}>\n-# <t:${nowTs()}:T>` }],
          }],
        });
        return;
      }

      // ── Staff Apps: Apply → show modal ────────────────────────────────────
      if (customId.startsWith("staffapply_")) {
        const typeKey = customId.replace("staffapply_", "");
        if (!STAFF_APP_TYPES[typeKey]) return;
        await interaction.showModal(buildStaffModal(typeKey));
        return;
      }

      // ── Staff Apps: Accept ────────────────────────────────────────────────
      if (customId.startsWith("staffaccept_")) {
        const raw            = customId.slice("staffaccept_".length);
        const lastUnderscore = raw.lastIndexOf("_");
        const typeKey        = raw.slice(0, lastUnderscore);
        const userId         = raw.slice(lastUnderscore + 1);

        if (!canReviewStaffApp(interaction.member, typeKey)) {
          return interaction.reply({
            flags:   MessageFlags.Ephemeral,
            content: `❌ **Δεν έχεις δικαίωμα** να αξιολογήσεις αιτήσεις **${STAFF_APP_TYPES[typeKey]?.label ?? typeKey}**.\nΧρειάζεσαι τον ρόλο <@&${APP_REVIEWER_ROLES[typeKey]}>.`,
          });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const roleId = STAFF_APP_ROLES[typeKey];
        if (!roleId) {
          return interaction.editReply({ content: `❌ **Σφάλμα:** Το Role ID για \`${typeKey}\` δεν έχει ρυθμιστεί.` });
        }

        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) return interaction.editReply({ content: `❌ **Σφάλμα:** Ρόλος \`${roleId}\` δεν βρέθηκε.` });

        const botMember = interaction.guild.members.me;
        if (botMember.roles.highest.comparePositionTo(role) <= 0) {
          return interaction.editReply({ content: `❌ **Σφάλμα:** Ο ρόλος **${role.name}** είναι πάνω από το bot στην ιεραρχία.` });
        }

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) return interaction.editReply({ content: `❌ **Σφάλμα:** Ο χρήστης <@${userId}> δεν βρέθηκε (ίσως έχει φύγει).` });

        await member.roles.add(role).catch((e) => console.error("[STAFFACCEPT] roles.add failed:", e));

        const cached = appAnswerCache.get(interaction.message.id);
        if (cached) {
          const decidedUser = { id: cached.user.id, tag: cached.user.tag, displayAvatarURL: () => cached.user.avatarURL };
          await interaction.message.edit(
            buildStaffReviewDecidedPayload(typeKey, decidedUser, cached.answers, "accept", `<@${interaction.user.id}>`)
          ).catch((e) => console.error("[STAFFACCEPT] embed update failed:", e));
          appAnswerCache.delete(interaction.message.id);
        }

        await interaction.channel.send(buildStaffAcceptLogPayload(typeKey, userId, `<@${interaction.user.id}>`, roleId)).catch(console.error);

        const responseChannel = APP_RESPONSE_CHANNELS[typeKey]
          ? await interaction.client.channels.fetch(APP_RESPONSE_CHANNELS[typeKey]).catch(() => null)
          : null;
        if (responseChannel) {
          await responseChannel.send(buildStaffAcceptAnnouncementPayload(typeKey, member.user, `<@${interaction.user.id}>`)).catch(console.error);
        }

        await member.send(buildStaffAcceptDmPayload(typeKey)).catch(() => {
          console.warn(`[STAFFACCEPT] Could not DM ${member.user.tag}`);
        });

        await interaction.editReply({ content: `✅ Εγκρίθηκε! Ο ρόλος **${role.name}** ανατέθηκε σε <@${userId}>.` });
        return;
      }

      // ── Staff Apps: Reject ────────────────────────────────────────────────
      if (customId.startsWith("staffreject_")) {
        const raw            = customId.slice("staffreject_".length);
        const lastUnderscore = raw.lastIndexOf("_");
        const typeKey        = raw.slice(0, lastUnderscore);
        const userId         = raw.slice(lastUnderscore + 1);

        if (!canReviewStaffApp(interaction.member, typeKey)) {
          return interaction.reply({
            flags:   MessageFlags.Ephemeral,
            content: `❌ **Δεν έχεις δικαίωμα** να αξιολογήσεις αιτήσεις **${STAFF_APP_TYPES[typeKey]?.label ?? typeKey}**.\nΧρειάζεσαι τον ρόλο <@&${APP_REVIEWER_ROLES[typeKey]}>.`,
          });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const cached = appAnswerCache.get(interaction.message.id);
        if (cached) {
          const decidedUser = { id: cached.user.id, tag: cached.user.tag, displayAvatarURL: () => cached.user.avatarURL };
          await interaction.message.edit(
            buildStaffReviewDecidedPayload(typeKey, decidedUser, cached.answers, "reject", `<@${interaction.user.id}>`)
          ).catch((e) => console.error("[STAFFREJECT] embed update failed:", e));
          appAnswerCache.delete(interaction.message.id);
        }

        await interaction.channel.send(buildStaffRejectLogPayload(typeKey, userId, `<@${interaction.user.id}>`)).catch(console.error);

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (member) {
          await member.send(buildStaffRejectDmPayload(typeKey)).catch(() => {
            console.warn(`[STAFFREJECT] Could not DM ${member.user.tag}`);
          });
        }

        await interaction.editReply({ content: `❌ Απορρίφθηκε. Ο χρήστης <@${userId}> ενημερώθηκε με DM.` });
        return;
      }

      // ── Criminal Apps: Navigation ─────────────────────────────────────────
      if (customId === "crim_back_panel") {
        await interaction.update(cv2_MainPanel());
        return;
      }

      // ── Criminal Apps: Apply → show modal ────────────────────────────────
      if (customId === "crimapply_mafia")  { await interaction.showModal(buildCrimModal("mafia"));  return; }
      if (customId === "crimapply_cartel") { await interaction.showModal(buildCrimModal("cartel")); return; }
      if (customId === "crimapply_gang")   { await interaction.showModal(buildCrimModal("gang"));   return; }

      // ── Criminal Apps: Accept ─────────────────────────────────────────────
      if (customId.startsWith("crimaccept_")) {
        // deferUpdate FIRST — before any async work — prevents Unknown Interaction
        await interaction.deferUpdate();

        if (!interaction.member.roles.cache.has(CRIM_CONFIG.REVIEWER_ROLE_ID)) {
          await safeEphemeral(interaction, cv2_NoPermission());
          return;
        }

        const appId = customId.slice("crimaccept_".length);
        const app   = crimPending.get(appId);
        if (!app) {
          await safeEphemeral(interaction, cv2_AlreadyHandled());
          return;
        }

        crimPending.delete(appId);

        try {
          const applicant = await interaction.guild.members.fetch(app.userId).catch(() => null);

          if (applicant && CRIM_CONFIG.ACCEPTED_ROLE_ID) {
            await applicant.roles.add(CRIM_CONFIG.ACCEPTED_ROLE_ID).catch((e) =>
              console.error("[CrimAccept] role add:", e.message)
            );
          }

          const category = await getOrCreateCrimCategory(interaction.guild);

          const username  = applicant?.user?.username ?? app.userId;
          const safeName  = `team-${username}`
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "")
            .replace(/-+/g, "-")
            .slice(0, 28);

          const privateChannel = await interaction.guild.channels.create({
            name: `🔫${safeName}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
              ...(applicant ? [{
                id: app.userId,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              }] : []),
              {
                id: CRIM_CONFIG.REVIEWER_ROLE_ID,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.ManageMessages,
                  PermissionsBitField.Flags.ManageChannels,
                ],
              },
              {
                id: client.user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
            ],
          });

          await privateChannel.send(cv2_PrivateWelcome(appId, app.userId, app.type, app.answers));

          if (applicant) {
            await applicant.send(cv2_DmAccepted(appId, app.type, privateChannel.name)).catch(() => {});
          }

          await interaction.message.edit(cv2_ReviewDone(appId, app.type, app.userId, interaction.user, true));

          console.log(`[CrimAccept] ✅ ${app.type} | User: ${app.userId} | Channel: ${privateChannel.name}`);
        } catch (err) {
          console.error("[CrimAccept] Error:", err.message);
        }
        return;
      }

      // ── Criminal Apps: Reject ─────────────────────────────────────────────
      if (customId.startsWith("crimreject_")) {
        // deferUpdate FIRST — before any async work — prevents Unknown Interaction
        await interaction.deferUpdate();

        if (!interaction.member.roles.cache.has(CRIM_CONFIG.REVIEWER_ROLE_ID)) {
          await safeEphemeral(interaction, cv2_NoPermission());
          return;
        }

        const appId = customId.slice("crimreject_".length);
        const app   = crimPending.get(appId);
        if (!app) {
          await safeEphemeral(interaction, cv2_AlreadyHandled());
          return;
        }

        crimPending.delete(appId);

        try {
          const applicant = await interaction.guild.members.fetch(app.userId).catch(() => null);
          if (applicant) {
            await applicant.send(cv2_DmRejected(appId, app.type)).catch(() => {});
          }
          await interaction.message.edit(cv2_ReviewDone(appId, app.type, app.userId, interaction.user, false));
          console.log(`[CrimReject] ❌ ${app.type} | User: ${app.userId}`);
        } catch (err) {
          console.error("[CrimReject] Error:", err.message);
        }
        return;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MODAL SUBMITS
    // ══════════════════════════════════════════════════════════════════════════
    if (interaction.isModalSubmit()) {
      const { customId } = interaction;

      // ── Staff App modals ──────────────────────────────────────────────────
      if (customId.startsWith("staffmodal_")) {
        const typeKey = customId.replace("staffmodal_", "");
        if (!STAFF_APP_TYPES[typeKey]) return;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const answers = {};
        for (const q of STAFF_APP_MODALS[typeKey]) {
          answers[q.id] = interaction.fields.getTextInputValue(q.id);
        }

        const reviewChannel = await interaction.client.channels.fetch(REVIEW_CHANNELS[typeKey]).catch(() => null);
        if (!reviewChannel) {
          return interaction.editReply({ content: "❌ Δεν βρέθηκε το κανάλι αναθεώρησης. Επικοινώνησε με Admin." });
        }

        const reviewMsg = await reviewChannel.send(buildStaffReviewPayload(typeKey, interaction.user, answers));

        appAnswerCache.set(reviewMsg.id, {
          typeKey,
          user: {
            id:        interaction.user.id,
            tag:       interaction.user.tag,
            avatarURL: interaction.user.displayAvatarURL({ extension: "png", size: 256 }),
          },
          answers,
        });

        await interaction.editReply(buildStaffApplyConfirmEphemeral(typeKey));
        return;
      }

      // ── Criminal App modals ───────────────────────────────────────────────
      if (customId.startsWith("crimmodal_")) {
        const type      = customId.replace("crimmodal_", "");
        const typeLabel = { mafia: "Mafia", cartel: "Cartel", gang: "Gang" }[type];

        if (!typeLabel) return;

        const answers = {
          discordLink:  interaction.fields.getTextInputValue("discordLink"),
          jobName:      interaction.fields.getTextInputValue("jobName"),
          avgAge:       interaction.fields.getTextInputValue("avgAge"),
          memberCount:  interaction.fields.getTextInputValue("memberCount"),
          dailyHours:   interaction.fields.getTextInputValue("dailyHours"),
        };

        crimAppSeq++;
        const appId = `${type.toUpperCase()}-${Date.now()}-${crimAppSeq}`;

        const reviewCh = interaction.guild.channels.cache.get(CRIM_CONFIG.APPLICATIONS_CHANNEL_ID);
        if (!reviewCh) {
          const errC = new ContainerBuilder().setAccentColor(CRIM_CONFIG.C_RED);
          errC.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## ❌ Σφάλμα\nΔεν βρέθηκε το κανάλι αιτήσεων. Επικοινώνησε με admin."
            )
          );
          return interaction.reply({
            components: [errC],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
        }

        await reviewCh.send(cv2_ReviewMsg(appId, interaction.user, typeLabel, answers));
        crimPending.set(appId, { userId: interaction.user.id, type: typeLabel, answers });

        await interaction.reply(cv2_AppSubmitted(appId, typeLabel));

        console.log(`[CrimSubmit] 📋 ${typeLabel} | User: ${interaction.user.tag} | ID: ${appId}`);
        return;
      }
    }

  } catch (err) {
    console.error("Interaction error:", err);
    try {
      const method = interaction.deferred || interaction.replied ? "editReply" : "reply";
      await interaction[method]({ content: `❌ Error: ${err.message}`, flags: MessageFlags.Ephemeral });
    } catch {}
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  LOG EVENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Join ──────────────────────────────────────────────────────────────────────
client.on("guildMemberAdd", async (member) => {
  const ch = getLogChannel(member.guild.id, "join");
  if (!ch) return;
  const embed = buildEmbed(member.guild, 0x57f287, "+ Join Logs", [
    { name: "👤 User",             value: `${member.user.tag} (<@${member.id}>)`, inline: false },
    { name: "🕐 Time Joined",      value: ts(),                                    inline: true  },
    { name: "📅 Account Register", value: ts(member.user.createdAt),               inline: true  },
  ]);
  embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Leave ─────────────────────────────────────────────────────────────────────
client.on("guildMemberRemove", async (member) => {
  const ch = getLogChannel(member.guild.id, "leave");
  if (!ch) return;
  const embed = buildEmbed(member.guild, 0xed4245, "+ Leave Logs", [
    { name: "👤 Mention",          value: `<@${member.id}>`,        inline: false },
    { name: "🕐 Time Left",        value: ts(),                      inline: true  },
    { name: "📅 Account Register", value: ts(member.user.createdAt), inline: true  },
  ]);
  embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Kick ──────────────────────────────────────────────────────────────────────
client.on("guildMemberRemove", async (member) => {
  const ch = getLogChannel(member.guild.id, "kick");
  if (!ch) return;
  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.target.id !== member.id) return;
    if (Date.now() - entry.createdTimestamp > 5000) return;
    const embed = buildEmbed(member.guild, 0xfee75c, "+ Kick Logs", [
      { name: "👤 User",   value: `${member.user.tag} (<@${member.id}>)`, inline: false },
      { name: "🔨 By",     value: `<@${entry.executor.id}>`,               inline: true  },
      { name: "📝 Reason", value: entry.reason || "No reason",             inline: true  },
    ]);
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
    await ch.send({ embeds: [embed] });
  } catch {}
});

// ── Ban ───────────────────────────────────────────────────────────────────────
client.on("guildBanAdd", async (ban) => {
  const ch = getLogChannel(ban.guild.id, "ban");
  if (!ch) return;
  let executor = "Unknown", reason = ban.reason || "No reason";
  try {
    const logs  = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const entry = logs.entries.first();
    if (entry && entry.target.id === ban.user.id) executor = `<@${entry.executor.id}>`;
  } catch {}
  const embed = buildEmbed(ban.guild, 0xed4245, "+ Ban Logs", [
    { name: "👤 Mention",   value: `<@${ban.user.id}>`, inline: false },
    { name: "🔨 Banned By", value: executor,             inline: true  },
    { name: "📝 Reason",    value: reason,               inline: true  },
    { name: "🕐 Time",      value: ts(),                 inline: false },
  ]);
  embed.setThumbnail(ban.user.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Unban ─────────────────────────────────────────────────────────────────────
client.on("guildBanRemove", async (ban) => {
  const ch = getLogChannel(ban.guild.id, "unban");
  if (!ch) return;
  let executor = "Unknown";
  try {
    const logs  = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
    const entry = logs.entries.first();
    if (entry && entry.target.id === ban.user.id) executor = `<@${entry.executor.id}>`;
  } catch {}
  const embed = buildEmbed(ban.guild, 0x57f287, "+ UnBan Logs", [
    { name: "👤 Mention",     value: `<@${ban.user.id}>`, inline: false },
    { name: "🔓 UnBanned By", value: executor,            inline: true  },
    { name: "🕐 Time",        value: ts(),                inline: true  },
  ]);
  embed.setThumbnail(ban.user.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Message Sent ──────────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  const ch = getLogChannel(message.guild.id, "message");
  if (!ch) return;
  if (message.channel.id === ch.id) return;

  const embed = buildEmbed(message.guild, 0x5865f2, "+ Message Logs", [
    { name: "👤 Mention",      value: `<@${message.author.id}>`,                            inline: false },
    { name: "📌 Channel",      value: `<#${message.channel.id}>`,                           inline: true  },
    { name: "🕐 Time",         value: ts(message.createdAt),                                inline: true  },
    { name: "💬 Message Sent", value: (message.content || "*[No text content]*").slice(0, 1024), inline: false },
  ]);
  embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Message Edited ────────────────────────────────────────────────────────────
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!newMessage.guild) return;
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const ch = getLogChannel(newMessage.guild.id, "message");
  if (!ch) return;
  if (newMessage.channel.id === ch.id) return;

  const before = (oldMessage.content || "*[Not cached / No text]*").slice(0, 1024);
  const after  = (newMessage.content || "*[No text content]*").slice(0, 1024);

  const embed = buildEmbed(newMessage.guild, 0xffa500, "✏️ Message Edited", [
    { name: "👤 Author",          value: `<@${newMessage.author.id}>`,      inline: false },
    { name: "📌 Channel",         value: `<#${newMessage.channel.id}>`,     inline: true  },
    { name: "🕐 Edited At",       value: ts(),                              inline: true  },
    { name: "🔗 Jump to Message", value: `[Click here](${newMessage.url})`, inline: false },
    { name: "📝 Before",          value: before,                            inline: false },
    { name: "📝 After",           value: after,                             inline: false },
  ]);
  embed.setThumbnail(newMessage.author.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Message Deleted ───────────────────────────────────────────────────────────
client.on("messageDelete", async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const ch = getLogChannel(message.guild.id, "message");
  if (!ch) return;
  if (message.channel.id === ch.id) return;

  let deletedBy = "Unknown (or self-delete)";
  try {
    await new Promise((r) => setTimeout(r, 1000));
    const logs  = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
    const entry = logs.entries.first();
    if (
      entry &&
      entry.target.id === message.author?.id &&
      entry.extra?.channel?.id === message.channel.id &&
      Date.now() - entry.createdTimestamp < 5000
    ) {
      deletedBy = `<@${entry.executor.id}>`;
    }
  } catch {}

  const embed = buildEmbed(message.guild, 0xed4245, "🗑️ Message Deleted", [
    { name: "👤 Author",     value: message.author ? `<@${message.author.id}>` : "Unknown",          inline: false },
    { name: "📌 Channel",    value: `<#${message.channel.id}>`,                                       inline: true  },
    { name: "🕐 Deleted At", value: ts(),                                                             inline: true  },
    { name: "🔍 Deleted By", value: deletedBy,                                                        inline: false },
    { name: "💬 Content",    value: (message.content || "*[No text content]*").slice(0, 1024),        inline: false },
  ]);
  if (message.author) embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Voice State ───────────────────────────────────────────────────────────────
client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild  = newState.guild || oldState.guild;
  const ch     = getLogChannel(guild.id, "voice");
  if (!ch) return;

  const member = newState.member || oldState.member;
  const user   = member?.user;
  if (!user) return;

  let embed = null;

  async function fetchModerator() {
    try {
      await new Promise((r) => setTimeout(r, 600));
      const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === user.id && Date.now() - entry.createdTimestamp < 5000)
        return `<@${entry.executor.id}>`;
    } catch {}
    return "Unknown";
  }

  if (!oldState.channelId && newState.channelId) {
    embed = buildEmbed(guild, 0x57f287, "+ Voice Join", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  } else if (oldState.channelId && !newState.channelId) {
    embed = buildEmbed(guild, 0xed4245, "+ Voice Leave", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: oldState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  } else if (oldState.channelId !== newState.channelId) {
    embed = buildEmbed(guild, 0xfee75c, "+ Voice Move", [
      { name: "👤 User", value: `<@${user.id}>`,               inline: false },
      { name: "📤 From", value: oldState.channel?.name || "?", inline: true  },
      { name: "📥 To",   value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time", value: ts(),                           inline: false },
    ]);
  } else if (!oldState.serverMute && newState.serverMute) {
    const by = await fetchModerator();
    embed = buildEmbed(guild, 0xed4245, "🔇 Voice Server Muted", [
      { name: "👤 User",     value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel",  value: newState.channel?.name || "?", inline: true  },
      { name: "🔇 Muted By", value: by,                            inline: true  },
      { name: "🕐 Time",     value: ts(),                           inline: false },
    ]);
  } else if (oldState.serverMute && !newState.serverMute) {
    const by = await fetchModerator();
    embed = buildEmbed(guild, 0x57f287, "🔊 Voice Server Unmuted", [
      { name: "👤 User",       value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel",    value: newState.channel?.name || "?", inline: true  },
      { name: "🔊 Unmuted By", value: by,                            inline: true  },
      { name: "🕐 Time",       value: ts(),                           inline: false },
    ]);
  } else if (!oldState.serverDeaf && newState.serverDeaf) {
    const by = await fetchModerator();
    embed = buildEmbed(guild, 0xed4245, "🔕 Voice Server Deafened", [
      { name: "👤 User",        value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel",     value: newState.channel?.name || "?", inline: true  },
      { name: "🔕 Deafened By", value: by,                            inline: true  },
      { name: "🕐 Time",        value: ts(),                           inline: false },
    ]);
  } else if (oldState.serverDeaf && !newState.serverDeaf) {
    const by = await fetchModerator();
    embed = buildEmbed(guild, 0x57f287, "🔔 Voice Server Undeafened", [
      { name: "👤 User",          value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel",       value: newState.channel?.name || "?", inline: true  },
      { name: "🔔 Undeafened By", value: by,                            inline: true  },
      { name: "🕐 Time",          value: ts(),                           inline: false },
    ]);
  } else if (!oldState.selfMute && newState.selfMute) {
    embed = buildEmbed(guild, 0x99aab5, "🔇 Voice Self-Muted", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  } else if (oldState.selfMute && !newState.selfMute) {
    embed = buildEmbed(guild, 0x99aab5, "🔊 Voice Self-Unmuted", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  } else if (!oldState.selfDeaf && newState.selfDeaf) {
    embed = buildEmbed(guild, 0x99aab5, "🔕 Voice Self-Deafened", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  } else if (oldState.selfDeaf && !newState.selfDeaf) {
    embed = buildEmbed(guild, 0x99aab5, "🔔 Voice Self-Undeafened", [
      { name: "👤 User",    value: `<@${user.id}>`,               inline: false },
      { name: "🔊 Channel", value: newState.channel?.name || "?", inline: true  },
      { name: "🕐 Time",    value: ts(),                           inline: true  },
    ]);
  }

  if (embed) {
    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
    await ch.send({ embeds: [embed] });
  }
});

// ── Role Logs ─────────────────────────────────────────────────────────────────
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const ch = getLogChannel(newMember.guild.id, "role");
  if (!ch) return;

  const added   = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id));
  const removed = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id));

  let executor = "Unknown";
  try {
    const logs  = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
    const entry = logs.entries.first();
    if (entry && entry.target.id === newMember.id) executor = `<@${entry.executor.id}>`;
  } catch {}

  for (const [, role] of added) {
    const embed = buildEmbed(newMember.guild, 0x57f287, "+ Role Logs - Added", [
      { name: "👤 Mention",       value: `<@${newMember.id}>`, inline: false },
      { name: "👤 Role Added By", value: executor,              inline: true  },
      { name: "🏷️ Role",          value: `<@&${role.id}>`,     inline: true  },
      { name: "🕐 Time Added",    value: ts(),                  inline: false },
    ]);
    embed.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));
    await ch.send({ embeds: [embed] });
  }

  for (const [, role] of removed) {
    const embed = buildEmbed(newMember.guild, 0xed4245, "+ Role Logs - Removed", [
      { name: "👤 Mention",         value: `<@${newMember.id}>`, inline: false },
      { name: "👤 Role Removed By", value: executor,              inline: true  },
      { name: "🏷️ Role",            value: `<@&${role.id}>`,     inline: true  },
      { name: "🕐 Time Removed",    value: ts(),                  inline: false },
    ]);
    embed.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));
    await ch.send({ embeds: [embed] });
  }
});

// ── Nickname Logs ─────────────────────────────────────────────────────────────
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (oldMember.nickname === newMember.nickname) return;
  const ch = getLogChannel(newMember.guild.id, "nickname");
  if (!ch) return;

  let executor = "Unknown";
  try {
    const logs  = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
    const entry = logs.entries.first();
    if (entry && entry.target.id === newMember.id) executor = `<@${entry.executor.id}>`;
  } catch {}

  const embed = buildEmbed(newMember.guild, 0x9b59b6, "+ Nickname Logs", [
    { name: "👤 Mention",             value: `<@${newMember.id}>`, inline: false },
    { name: "✏️ Nickname Changed By", value: executor,             inline: true  },
    {
      name:   "🏷️ Nickname",
      value:  `${oldMember.nickname || oldMember.user.username} → ${newMember.nickname || newMember.user.username}`,
      inline: false,
    },
    { name: "🕐 Time", value: ts(), inline: true },
  ]);
  embed.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));
  await ch.send({ embeds: [embed] });
});

// ── Channel Logs ──────────────────────────────────────────────────────────────
client.on("channelCreate", async (channel) => {
  if (!channel.guild) return;
  const ch = getLogChannel(channel.guild.id, "channel");
  if (!ch) return;
  let executor = "Unknown";
  try {
    const logs  = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
    const entry = logs.entries.first();
    if (entry) executor = `<@${entry.executor.id}>`;
  } catch {}
  const embed = buildEmbed(channel.guild, 0x57f287, "+ Channel Created", [
    { name: "👤 By",           value: executor,                                                    inline: true  },
    { name: "🕐 Time",         value: ts(),                                                        inline: true  },
    { name: "📺 Channel Type", value: channel.type === ChannelType.GuildText ? "Text" : "Other",  inline: true  },
    { name: "📛 Channel Name", value: channel.name,                                                inline: true  },
    { name: "🆔 Channel ID",   value: channel.id,                                                  inline: true  },
  ]);
  await ch.send({ embeds: [embed] });
});

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const ch = getLogChannel(channel.guild.id, "channel");
  if (!ch) return;
  let executor = "Unknown";
  try {
    const logs  = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = logs.entries.first();
    if (entry) executor = `<@${entry.executor.id}>`;
  } catch {}
  const embed = buildEmbed(channel.guild, 0xed4245, "+ Channel Deleted", [
    { name: "👤 By",           value: executor,                                                    inline: true  },
    { name: "🕐 Time",         value: ts(),                                                        inline: true  },
    { name: "📺 Channel Type", value: channel.type === ChannelType.GuildText ? "Text" : "Other",  inline: true  },
    { name: "📛 Channel Name", value: channel.name,                                                inline: true  },
    { name: "🆔 Channel ID",   value: channel.id,                                                  inline: true  },
  ]);
  await ch.send({ embeds: [embed] });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

// ── Security config paths ─────────────────────────────────────────────────────
const SECURITY_CONFIG_PATH   = path.join(__dirname, "security_config.json");
const SECURITY_LOGS_PATH     = path.join(__dirname, "security_logs.json");

// ── Security log channel names ────────────────────────────────────────────────
const SECURITY_LOG_CHANNELS = {
  antilink:    "🔗antilink-logs",
  antispam:    "⚡antispam-logs",
  antibot:     "🤖antibot-logs",
  antiwebhook: "🪝antiwebhook-logs",
  antialt:     "👶antialt-logs",
  antichannel: "📁antichannel-logs",
  antirole:    "🏷️antirole-logs",
  antiban:     "🔨antiban-logs",
  antikick:    "👢antikick-logs",
};

// ── Spam tracking ─────────────────────────────────────────────────────────────
// Map<guildId_userId, { count, lastReset, warned }>
const spamTracker = new Map();
const SPAM_THRESHOLD  = 5;   // messages
const SPAM_WINDOW_MS  = 4000; // within 4 seconds
const SPAM_MUTE_MS    = 10 * 60 * 1000; // 10 minutes timeout

// ── Link regex ────────────────────────────────────────────────────────────────
const LINK_REGEX = /(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)[^\s]*/gi;
const DISCORD_INVITE_REGEX = /(discord\.gg\/|discord\.com\/invite\/)[^\s]*/gi;

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY CONFIG HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function loadSecurityConfig() {
  if (!fs.existsSync(SECURITY_CONFIG_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(SECURITY_CONFIG_PATH, "utf8")); }
  catch { return {}; }
}

function saveSecurityConfig(data) {
  fs.writeFileSync(SECURITY_CONFIG_PATH, JSON.stringify(data, null, 2));
}

function getSecurityGuild(guildId) {
  const cfg = loadSecurityConfig();
  if (!cfg[guildId]) cfg[guildId] = {
    enabled: {
      antilink:    true,
      antispam:    true,
      antibot:     true,
      antiwebhook: true,
      antialt:     true,
      antichannel: true,
      antirole:    true,
      antiban:     true,
      antikick:    true,
    },
    whitelist: {
      roles:    [],   // role IDs — bypass ALL security checks
      users:    [],   // user IDs — bypass ALL security checks
      channels: [],   // channel IDs — bypass antilink + antispam only
    },
    // Criminal category ID — links always allowed here
    criminalCategoryId: CRIM_CONFIG.CRIMINAL_CATEGORY_ID || "",
    // Min account age in days for antialt (0 = disabled)
    altMinAgeDays: 7,
    logs: {},
  };
  return cfg[guildId];
}

function saveSecurityGuild(guildId, data) {
  const cfg = loadSecurityConfig();
  cfg[guildId] = data;
  saveSecurityConfig(cfg);
}

function getSecurityLogChannel(guild, type) {
  const sec = getSecurityGuild(guild.id);
  const id  = sec.logs?.[type];
  if (!id) return null;
  return guild.channels.cache.get(id) || null;
}

// ── Is whitelisted (bypasses all security) ────────────────────────────────────
function isSecurityWhitelisted(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const sec = getSecurityGuild(member.guild.id);
  if (sec.whitelist.users.includes(member.id)) return true;
  if (sec.whitelist.roles.some((r) => member.roles.cache.has(r))) return true;
  return false;
}

// ── Is channel whitelisted (bypasses antilink + antispam) ────────────────────
function isChannelWhitelisted(guild, channelId) {
  const sec = getSecurityGuild(guild.id);
  if (sec.whitelist.channels.includes(channelId)) return true;
  // Check if channel is inside the criminal teams category
  const channel = guild.channels.cache.get(channelId);
  if (channel && sec.criminalCategoryId && channel.parentId === sec.criminalCategoryId) return true;
  return false;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY EMBED BUILDER
// ══════════════════════════════════════════════════════════════════════════════
function buildSecurityEmbed(guild, color, title, fields) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`🛡️ Security | ${title}`)
    .setThumbnail(THUMBNAIL_LOGO)
    .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .addFields(fields)
    .setFooter({ text: `${guild.name} Security System`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .setTimestamp();
}

// ══════════════════════════════════════════════════════════════════════════════
//  !securitylogssetup COMMAND
// ══════════════════════════════════════════════════════════════════════════════
async function handleSecurityLogsSetup(message) {
  if (!message.guild) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ You need **Administrator** permissions.");
  }

  await message.reply("🛡️ Setting up security log channels, please wait...");

  const guild  = message.guild;
  const sec    = getSecurityGuild(guild.id);

  // Find or create Security Logs category
  let category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === "🛡️ security logs"
  );
  if (!category) {
    category = await guild.channels.create({
      name: "🛡️ Security Logs",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: guild.members.me, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });
  }

  const results = [];
  for (const [key, channelName] of Object.entries(SECURITY_LOG_CHANNELS)) {
    let existing = guild.channels.cache.find(
      (c) => c.name === channelName && c.parentId === category.id
    );
    if (!existing) {
      existing = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: guild.members.me, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
      });
    }
    if (!sec.logs) sec.logs = {};
    sec.logs[key] = existing.id;
    results.push(`✅ \`${channelName}\` → <#${existing.id}>`);
  }

  saveSecurityGuild(guild.id, sec);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🛡️ Security Log Channels Setup Complete")
    .setThumbnail(THUMBNAIL_LOGO)
    .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .setDescription(results.join("\n"))
    .addFields(
      { name: "ℹ️ Commands", value:
        "`!security <module> <on/off>` — enable/disable a module\n" +
        "`!secsettings` — view current security settings\n" +
        "`!secwl role add/remove @role` — whitelist a role\n" +
        "`!secwl user add/remove @user` — whitelist a user\n" +
        "`!secwl channel add/remove #channel` — whitelist a channel (antilink/antispam bypass)\n" +
        "`!secwl crimcat <categoryId>` — set criminal category (links always allowed)\n" +
        "`!secwl altdays <days>` — set minimum account age for antialt (0 = off)", inline: false },
    )
    .setFooter({ text: `${guild.name} Security Setup`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY PREFIX COMMANDS  (injected into the existing messageCreate handler)
// ══════════════════════════════════════════════════════════════════════════════

// ── !security <module> <on|off> ───────────────────────────────────────────────
async function handleSecurityToggle(message, args) {
  if (!message.guild) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ You need **Administrator** permissions.");
  }
  const module = args[0]?.toLowerCase();
  const toggle = args[1]?.toLowerCase();
  const validModules = Object.keys(SECURITY_LOG_CHANNELS);
  if (!module || !validModules.includes(module)) {
    return message.reply(`❌ Valid modules: \`${validModules.join(", ")}\``);
  }
  if (!["on", "off"].includes(toggle)) {
    return message.reply("❌ Use `on` or `off`.");
  }
  const sec = getSecurityGuild(message.guild.id);
  sec.enabled[module] = toggle === "on";
  saveSecurityGuild(message.guild.id, sec);
  await message.reply(`✅ **${module}** is now **${toggle === "on" ? "🟢 Enabled" : "🔴 Disabled"}**.`);
}

// ── !secsettings ──────────────────────────────────────────────────────────────
async function handleSecSettings(message) {
  if (!message.guild) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ You need **Administrator** permissions.");
  }
  const sec = getSecurityGuild(message.guild.id);
  const lines = Object.entries(sec.enabled).map(
    ([k, v]) => `${v ? "🟢" : "🔴"} \`${k}\``
  ).join("\n");

  const wlRoles    = sec.whitelist.roles.map((r) => `<@&${r}>`).join(", ") || "None";
  const wlUsers    = sec.whitelist.users.map((u) => `<@${u}>`).join(", ") || "None";
  const wlChannels = sec.whitelist.channels.map((c) => `<#${c}>`).join(", ") || "None";
  const crimCat    = sec.criminalCategoryId ? `<#${sec.criminalCategoryId}> (category)` : "Not set";

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🛡️ Security Settings")
    .setThumbnail(THUMBNAIL_LOGO)
    .addFields(
      { name: "📦 Modules",            value: lines,       inline: false },
      { name: "🏷️ Whitelisted Roles",  value: wlRoles,     inline: true  },
      { name: "👤 Whitelisted Users",  value: wlUsers,     inline: true  },
      { name: "📌 Whitelisted Channels (antilink/antispam bypass)", value: wlChannels, inline: false },
      { name: "🔫 Criminal Category (links allowed)", value: crimCat, inline: false },
      { name: "👶 Anti-Alt Min Age",   value: `${sec.altMinAgeDays} day(s) (0 = off)`, inline: true },
    )
    .setFooter({ text: message.guild.name })
    .setTimestamp();
  await message.reply({ embeds: [embed] });
}

// ── !secwl ────────────────────────────────────────────────────────────────────
async function handleSecWhitelist(message, args) {
  if (!message.guild) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ You need **Administrator** permissions.");
  }

  const type   = args[0]?.toLowerCase(); // role | user | channel | crimcat | altdays
  const action = args[1]?.toLowerCase(); // add | remove  (not needed for crimcat/altdays)
  const sec    = getSecurityGuild(message.guild.id);

  // !secwl crimcat <categoryId>
  if (type === "crimcat") {
    const catId = args[1];
    if (!catId) return message.reply("❌ Usage: `!secwl crimcat <categoryId>`");
    sec.criminalCategoryId = catId;
    saveSecurityGuild(message.guild.id, sec);
    return message.reply(`✅ Criminal category set to \`${catId}\` — links are always allowed in channels under this category.`);
  }

  // !secwl altdays <number>
  if (type === "altdays") {
    const days = parseInt(args[1]);
    if (isNaN(days) || days < 0) return message.reply("❌ Usage: `!secwl altdays <number>` (0 = disable antialt)");
    sec.altMinAgeDays = days;
    saveSecurityGuild(message.guild.id, sec);
    return message.reply(`✅ Anti-alt minimum account age set to **${days}** day(s)${days === 0 ? " (disabled)" : ""}.`);
  }

  if (!["role", "user", "channel"].includes(type) || !["add", "remove"].includes(action)) {
    return message.reply(
      "❌ Usage:\n" +
      "`!secwl role add/remove @role`\n" +
      "`!secwl user add/remove @user`\n" +
      "`!secwl channel add/remove #channel`\n" +
      "`!secwl crimcat <categoryId>`\n" +
      "`!secwl altdays <days>`"
    );
  }

  let targetId = null;
  if (type === "role") {
    targetId = message.mentions.roles.first()?.id;
    if (!targetId) return message.reply("❌ Please mention a role.");
  } else if (type === "user") {
    targetId = message.mentions.users.first()?.id;
    if (!targetId) return message.reply("❌ Please mention a user.");
  } else if (type === "channel") {
    targetId = message.mentions.channels.first()?.id;
    if (!targetId) return message.reply("❌ Please mention a channel.");
  }

  const listKey = type === "role" ? "roles" : type === "user" ? "users" : "channels";
  if (!sec.whitelist[listKey]) sec.whitelist[listKey] = [];

  if (action === "add") {
    if (sec.whitelist[listKey].includes(targetId)) {
      return message.reply("⚠️ Already whitelisted.");
    }
    sec.whitelist[listKey].push(targetId);
    saveSecurityGuild(message.guild.id, sec);
    const mention = type === "role" ? `<@&${targetId}>` : type === "user" ? `<@${targetId}>` : `<#${targetId}>`;
    return message.reply(`✅ ${mention} added to **${type}** whitelist.`);
  } else {
    sec.whitelist[listKey] = sec.whitelist[listKey].filter((id) => id !== targetId);
    saveSecurityGuild(message.guild.id, sec);
    const mention = type === "role" ? `<@&${targetId}>` : type === "user" ? `<@${targetId}>` : `<#${targetId}>`;
    return message.reply(`✅ ${mention} removed from **${type}** whitelist.`);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  HOOK SECURITY COMMANDS INTO THE EXISTING messageCreate HANDLER
// ══════════════════════════════════════════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!")) return;
  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd  = args.shift().toLowerCase();

  if (cmd === "securitylogssetup") { await handleSecurityLogsSetup(message); return; }
  if (cmd === "security")          { await handleSecurityToggle(message, args); return; }
  if (cmd === "secsettings")       { await handleSecSettings(message); return; }
  if (cmd === "secwl")             { await handleSecWhitelist(message, args); return; }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-LINK + ANTI-SPAM  (messageCreate)
// ══════════════════════════════════════════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const guild  = message.guild;
  const member = message.member;
  const sec    = getSecurityGuild(guild.id);

  // Bail if member is whitelisted (admin / whitelist role / whitelist user)
  if (isSecurityWhitelisted(member)) return;

  const inWhitelistedChannel = isChannelWhitelisted(guild, message.channelId);

  // ── Anti-Link ────────────────────────────────────────────────────────────
  if (sec.enabled?.antilink && !inWhitelistedChannel) {
    if (LINK_REGEX.test(message.content)) {
      LINK_REGEX.lastIndex = 0; // reset regex state
      try {
        await message.delete();
      } catch {}

      // Timeout user for 2 minutes
      try {
        await member.timeout(2 * 60 * 1000, "Anti-Link: sent a link");
      } catch {}

      const logCh = getSecurityLogChannel(guild, "antilink");
      if (logCh) {
        const embed = buildSecurityEmbed(guild, 0xED4245, "Anti-Link", [
          { name: "👤 User",     value: `<@${member.id}> \`(${member.user.tag})\``, inline: false },
          { name: "📌 Channel",  value: `<#${message.channelId}>`,                  inline: true  },
          { name: "🕐 Time",     value: ts(),                                        inline: true  },
          { name: "💬 Content",  value: (message.content || "N/A").slice(0, 1024),  inline: false },
          { name: "⚙️ Action",   value: "Message deleted • Timeout 2 minutes",       inline: false },
        ]);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        await logCh.send({ embeds: [embed] }).catch(() => {});
      }

      await message.channel.send({
        content: `<@${member.id}> ❌ Links are not allowed here!`,
      }).then((m) => setTimeout(() => m.delete().catch(() => {}), 5000)).catch(() => {});
      return;
    }
    LINK_REGEX.lastIndex = 0;
  }

  // ── Anti-Spam ────────────────────────────────────────────────────────────
  if (sec.enabled?.antispam && !inWhitelistedChannel) {
    const key    = `${guild.id}_${member.id}`;
    const now    = Date.now();
    const entry  = spamTracker.get(key) || { count: 0, lastReset: now, warned: false };

    if (now - entry.lastReset > SPAM_WINDOW_MS) {
      entry.count     = 1;
      entry.lastReset = now;
      entry.warned    = false;
    } else {
      entry.count++;
    }
    spamTracker.set(key, entry);

    if (entry.count >= SPAM_THRESHOLD) {
      spamTracker.delete(key);

      // Delete recent messages from this user in the channel
      try {
        const fetched = await message.channel.messages.fetch({ limit: 20 });
        const userMsgs = fetched.filter(
          (m) => m.author.id === member.id &&
                 Date.now() - m.createdTimestamp < 10000
        );
        if (userMsgs.size > 0) {
          await message.channel.bulkDelete(userMsgs).catch(() => {});
        }
      } catch {}

      // Timeout for SPAM_MUTE_MS
      try {
        await member.timeout(SPAM_MUTE_MS, "Anti-Spam: message spam detected");
      } catch {}

      const logCh = getSecurityLogChannel(guild, "antispam");
      if (logCh) {
        const embed = buildSecurityEmbed(guild, 0xFFA500, "Anti-Spam", [
          { name: "👤 User",     value: `<@${member.id}> \`(${member.user.tag})\``,   inline: false },
          { name: "📌 Channel",  value: `<#${message.channelId}>`,                    inline: true  },
          { name: "🕐 Time",     value: ts(),                                          inline: true  },
          { name: "📊 Messages", value: `${SPAM_THRESHOLD}+ in ${SPAM_WINDOW_MS}ms`,  inline: false },
          { name: "⚙️ Action",   value: `Messages deleted • Timeout ${SPAM_MUTE_MS / 60000} minutes`, inline: false },
        ]);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        await logCh.send({ embeds: [embed] }).catch(() => {});
      }

      await message.channel.send({
        content: `<@${member.id}> ❌ Slow down! You have been timed out for **10 minutes** due to spam.`,
      }).then((m) => setTimeout(() => m.delete().catch(() => {}), 6000)).catch(() => {});
    }
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-BOT  (guildMemberAdd)
// ══════════════════════════════════════════════════════════════════════════════
client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const sec   = getSecurityGuild(guild.id);

  // ── Anti-Alt ──────────────────────────────────────────────────────────────
  if (sec.enabled?.antialt && sec.altMinAgeDays > 0) {
    const ageMs   = Date.now() - member.user.createdTimestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays < sec.altMinAgeDays) {
      let executor = "Auto-Security";
      try {
        await member.kick(`Anti-Alt: account age ${Math.floor(ageDays)} days < ${sec.altMinAgeDays} required`);
      } catch {}

      const logCh = getSecurityLogChannel(guild, "antialt");
      if (logCh) {
        const embed = buildSecurityEmbed(guild, 0x9B59B6, "Anti-Alt", [
          { name: "👤 User",         value: `<@${member.id}> \`(${member.user.tag})\``, inline: false },
          { name: "📅 Account Age",  value: `${Math.floor(ageDays)} day(s)`,            inline: true  },
          { name: "⛔ Min Required", value: `${sec.altMinAgeDays} day(s)`,              inline: true  },
          { name: "🕐 Time",         value: ts(),                                        inline: false },
          { name: "⚙️ Action",       value: "User kicked (possible alt account)",        inline: false },
        ]);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        await logCh.send({ embeds: [embed] }).catch(() => {});
      }
      return;
    }
  }

  // ── Anti-Bot ──────────────────────────────────────────────────────────────
  if (sec.enabled?.antibot && member.user.bot) {
    // Check if bot was added by an admin — if no audit log match, kick it
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
      const entry = logs.entries.first();
      const addedBy = entry?.executor || null;

      // If the person who added the bot is not an admin or is not whitelisted → kick
      if (addedBy) {
        const adderMember = await guild.members.fetch(addedBy.id).catch(() => null);
        if (adderMember && isSecurityWhitelisted(adderMember)) return; // allowed
      }

      await member.kick("Anti-Bot: unauthorized bot addition");

      const logCh = getSecurityLogChannel(guild, "antibot");
      if (logCh) {
        const embed = buildSecurityEmbed(guild, 0xFF6B6B, "Anti-Bot", [
          { name: "🤖 Bot",      value: `<@${member.id}> \`(${member.user.tag})\``,           inline: false },
          { name: "👤 Added By", value: addedBy ? `<@${addedBy.id}>` : "Unknown",             inline: true  },
          { name: "🕐 Time",     value: ts(),                                                   inline: true  },
          { name: "⚙️ Action",   value: "Bot kicked — unauthorized addition",                   inline: false },
        ]);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        await logCh.send({ embeds: [embed] }).catch(() => {});
      }
    } catch (e) {
      console.error("[AntiBot]", e.message);
    }
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-WEBHOOK  (webhookUpdate / channelWebhooksUpdate)
// ══════════════════════════════════════════════════════════════════════════════
client.on("webhookUpdate", async (channel) => {
  const guild = channel.guild;
  if (!guild) return;
  const sec = getSecurityGuild(guild.id);
  if (!sec.enabled?.antiwebhook) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.WebhookCreate, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor     = entry.executor;
    const execMember   = await guild.members.fetch(executor.id).catch(() => null);

    if (isSecurityWhitelisted(execMember)) return; // allowed

    // Delete the webhook
    try {
      const webhooks = await channel.fetchWebhooks();
      const newHook  = webhooks.find((w) => w.name === entry.target?.name);
      if (newHook) await newHook.delete("Anti-Webhook: unauthorized webhook creation");
    } catch {}

    // Timeout the executor
    if (execMember) {
      try { await execMember.timeout(10 * 60 * 1000, "Anti-Webhook: unauthorized webhook creation"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antiwebhook");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xE67E22, "Anti-Webhook", [
        { name: "👤 Executor",   value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "📌 Channel",    value: `<#${channel.id}>`,                                               inline: true  },
        { name: "🕐 Time",       value: ts(),                                                              inline: true  },
        { name: "⚙️ Action",     value: "Webhook deleted • Executor timed out 10 minutes",                inline: false },
      ]);
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiWebhook]", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-CHANNEL  (channelCreate via audit log check)
// ══════════════════════════════════════════════════════════════════════════════
client.on("channelCreate", async (channel) => {
  if (!channel.guild) return;
  const guild = channel.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antichannel) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    // Delete the channel
    try { await channel.delete("Anti-Channel: unauthorized channel creation"); } catch {}

    // Timeout executor
    if (execMember) {
      try { await execMember.timeout(10 * 60 * 1000, "Anti-Channel: unauthorized channel creation"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antichannel");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xE67E22, "Anti-Channel (Create)", [
        { name: "👤 Executor",    value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "📛 Channel",     value: channel.name,                                                     inline: true  },
        { name: "🕐 Time",        value: ts(),                                                              inline: true  },
        { name: "⚙️ Action",      value: "Channel deleted • Executor timed out 10 minutes",                inline: false },
      ]);
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiChannel Create]", e.message);
  }
});

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const guild = channel.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antichannel) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    // Timeout executor
    if (execMember) {
      try { await execMember.timeout(10 * 60 * 1000, "Anti-Channel: unauthorized channel deletion"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antichannel");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xED4245, "Anti-Channel (Delete)", [
        { name: "👤 Executor",    value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "📛 Channel",     value: channel.name,                                                     inline: true  },
        { name: "🕐 Time",        value: ts(),                                                              inline: true  },
        { name: "⚙️ Action",      value: "Executor timed out 10 minutes",                                   inline: false },
      ]);
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiChannel Delete]", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-ROLE  (roleCreate / roleDelete via audit log)
// ══════════════════════════════════════════════════════════════════════════════
client.on("roleCreate", async (role) => {
  const guild = role.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antirole) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    try { await role.delete("Anti-Role: unauthorized role creation"); } catch {}
    if (execMember) {
      try { await execMember.timeout(10 * 60 * 1000, "Anti-Role: unauthorized role creation"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antirole");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xE67E22, "Anti-Role (Create)", [
        { name: "👤 Executor", value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "🏷️ Role",    value: role.name,                                                        inline: true  },
        { name: "🕐 Time",    value: ts(),                                                              inline: true  },
        { name: "⚙️ Action",  value: "Role deleted • Executor timed out 10 minutes",                   inline: false },
      ]);
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiRole Create]", e.message);
  }
});

client.on("roleDelete", async (role) => {
  const guild = role.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antirole) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    if (execMember) {
      try { await execMember.timeout(10 * 60 * 1000, "Anti-Role: unauthorized role deletion"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antirole");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xED4245, "Anti-Role (Delete)", [
        { name: "👤 Executor", value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "🏷️ Role",    value: role.name,                                                        inline: true  },
        { name: "🕐 Time",    value: ts(),                                                              inline: true  },
        { name: "⚙️ Action",  value: "Executor timed out 10 minutes",                                   inline: false },
      ]);
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiRole Delete]", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-BAN  (guildBanAdd)
// ══════════════════════════════════════════════════════════════════════════════
client.on("guildBanAdd", async (ban) => {
  const guild = ban.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antiban) return;

  await new Promise((r) => setTimeout(r, 1000));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.target?.id !== ban.user.id) return;
    if (Date.now() - entry.createdTimestamp > 5000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    // Unban the victim
    try { await guild.members.unban(ban.user.id, "Anti-Ban: unauthorized ban reversed"); } catch {}

    // Timeout the executor
    if (execMember) {
      try { await execMember.timeout(30 * 60 * 1000, "Anti-Ban: unauthorized ban attempt"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antiban");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xED4245, "Anti-Ban", [
        { name: "👤 Executor",  value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "🎯 Target",    value: `<@${ban.user.id}> \`(${ban.user.tag})\``,                       inline: false },
        { name: "🕐 Time",      value: ts(),                                                              inline: true  },
        { name: "📝 Reason",    value: entry.reason || "No reason",                                      inline: true  },
        { name: "⚙️ Action",    value: "Ban reversed (unban) • Executor timed out 30 minutes",           inline: false },
      ]);
      if (ban.user) embed.setThumbnail(ban.user.displayAvatarURL({ dynamic: true }));
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiBan]", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-KICK  (guildMemberRemove → audit log check)
// ══════════════════════════════════════════════════════════════════════════════
client.on("guildMemberRemove", async (member) => {
  const guild = member.guild;
  const sec   = getSecurityGuild(guild.id);
  if (!sec.enabled?.antikick) return;

  await new Promise((r) => setTimeout(r, 1500));
  try {
    const logs  = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
    const entry = logs.entries.first();
    if (!entry || entry.target?.id !== member.id) return;
    if (Date.now() - entry.createdTimestamp > 6000) return;

    const executor   = entry.executor;
    const execMember = await guild.members.fetch(executor.id).catch(() => null);
    if (isSecurityWhitelisted(execMember)) return;

    // Timeout the executor
    if (execMember) {
      try { await execMember.timeout(30 * 60 * 1000, "Anti-Kick: unauthorized kick attempt"); } catch {}
    }

    const logCh = getSecurityLogChannel(guild, "antikick");
    if (logCh) {
      const embed = buildSecurityEmbed(guild, 0xFEE75C, "Anti-Kick", [
        { name: "👤 Executor",  value: executor ? `<@${executor.id}> \`(${executor.tag})\`` : "Unknown", inline: false },
        { name: "🎯 Target",    value: `<@${member.id}> \`(${member.user.tag})\``,                      inline: false },
        { name: "🕐 Time",      value: ts(),                                                              inline: true  },
        { name: "📝 Reason",    value: entry.reason || "No reason",                                      inline: true  },
        { name: "⚙️ Action",    value: "Executor timed out 30 minutes",                                   inline: false },
      ]);
      embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.error("[AntiKick]", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  AUTO-ROLE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
client.on("guildMemberAdd", async (member) => {
  if (!AUTOROLE_ID || AUTOROLE_ID === "YOUR_AUTOROLE_ROLE_ID") return;
  try {
    const role = member.guild.roles.cache.get(AUTOROLE_ID);
    if (!role) {
      console.warn(`[AutoRole] Role ${AUTOROLE_ID} not found in ${member.guild.name}`);
      return;
    }
    await member.roles.add(role, "Auto-Role on join");
    console.log(`[AutoRole] ✅ Gave ${role.name} to ${member.user.tag}`);
  } catch (e) {
    console.error("[AutoRole] Failed:", e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  DUTY TRACKING SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

// ── DB helpers ────────────────────────────────────────────────────────────────
function dutyGetUser(userId) {
  return dutyDB.prepare("SELECT * FROM duty_users WHERE user_id = ?").get(userId);
}

function dutyUpsertOnDuty(userId) {
  dutyDB.prepare(`
    INSERT INTO duty_users (user_id, is_on_duty, total_seconds)
    VALUES (?, 1, 0)
    ON CONFLICT(user_id) DO UPDATE SET is_on_duty = 1
  `).run(userId);
}

function dutyUpsertOffDuty(userId, secondsToAdd) {
  dutyDB.prepare(`
    INSERT INTO duty_users (user_id, total_seconds, is_on_duty)
    VALUES (?, ?, 0)
    ON CONFLICT(user_id) DO UPDATE SET
      total_seconds = total_seconds + ?,
      is_on_duty = 0
  `).run(userId, secondsToAdd, secondsToAdd);
}

function dutyLeaderboard() {
  return dutyDB.prepare(`
    SELECT user_id, total_seconds FROM duty_users
    WHERE total_seconds > 0
    ORDER BY total_seconds DESC LIMIT 10
  `).all();
}

function dutyFormatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}ω ${m}λ ${s}δ`;
  if (m > 0) return `${m}λ ${s}δ`;
  return `${s}δ`;
}

// ── On Duty handler ───────────────────────────────────────────────────────────
async function handleOnDuty(interaction) {
  const userId     = interaction.user.id;
  const voiceState = interaction.member?.voice;

  if (!voiceState?.channelId || !DUTY_VOICE_CHANNELS.includes(voiceState.channelId)) {
    return interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "❌ Πρέπει να είσαι σε ένα από τα **On Duty** κανάλια για να ξεκινήσεις.",
    });
  }

  if (dutyStartTimes.has(userId)) {
    return interaction.reply({ flags: MessageFlags.Ephemeral, content: "⚠️ Είσαι ήδη **On Duty**." });
  }

  dutyStartTimes.set(userId, Date.now());
  dutyUpsertOnDuty(userId);

  await interaction.reply({
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0x57F287,
      components: [{
        type: 10,
        content:
          `## ✅ On Duty
` +
          `Είσαι τώρα σε υπηρεσία. Ο χρόνος σου καταγράφεται.
` +
          `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${Math.floor(Date.now()/1000)}:F>`,
      }],
    }],
  });
}

// ── Off Duty handler ──────────────────────────────────────────────────────────
async function handleOffDuty(interaction) {
  const userId = interaction.user.id;

  if (!dutyStartTimes.has(userId)) {
    return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Δεν είσαι **On Duty**." });
  }

  const elapsed = Math.floor((Date.now() - dutyStartTimes.get(userId)) / 1000);
  dutyStartTimes.delete(userId);
  dutyUpsertOffDuty(userId, elapsed);

  await interaction.reply({
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xED4245,
      components: [{
        type: 10,
        content:
          `## 🔴 Off Duty
` +
          `Βάρδια αυτή τη φορά: **${dutyFormatTime(elapsed)}**
` +
          `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${Math.floor(Date.now()/1000)}:F>`,
      }],
    }],
  });
}

// ── Leaderboard handler ───────────────────────────────────────────────────────
async function handleDutyLeaderboard(interaction) {
  const rows = dutyLeaderboard();

  if (!rows.length) {
    return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Δεν υπάρχουν δεδομένα ακόμα." });
  }

  const medals = ["🥇", "🥈", "🥉"];
  const lines  = [];

  for (let i = 0; i < rows.length; i++) {
    const { user_id, total_seconds } = rows[i];
    const medal = i < 3 ? medals[i] : `#${i + 1}`;
    // Add any active session time too
    const bonus = dutyStartTimes.has(user_id)
      ? Math.floor((Date.now() - dutyStartTimes.get(user_id)) / 1000)
      : 0;
    const total = total_seconds + bonus;
    lines.push(`${medal} <@${user_id}> — **${dutyFormatTime(total)}**${bonus > 0 ? " 🟢" : ""}`);
  }

  await interaction.reply({
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xFFD700,
      components: [
        { type: 10, content: "## 🏆 Duty Leaderboard" },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: lines.join("\n") },
        { type: 14, divider: true, spacing: 0 },
        {
          type: 10,
          content: `-# 🟢 = currently on duty  |  <:logo:1472649971013783685> Apex Roleplay™ • <t:${Math.floor(Date.now()/1000)}:F>`,
        },
      ],
    }],
  });
}

// ── !resetduty <@user> — admin reset ─────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith("!resetduty")) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

  const target = message.mentions.members.first();
  if (!target) return message.reply("❌ Usage: `!resetduty @user`");

  dutyStartTimes.delete(target.id);
  dutyDB.prepare("UPDATE duty_users SET total_seconds = 0, is_on_duty = 0 WHERE user_id = ?").run(target.id);
  await message.reply(`✅ Duty data reset for <@${target.id}>.`);
});

// ── !setupduty — sends the duty panel ────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.content !== "!setupduty") return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

  await message.delete().catch(() => {});

  await message.channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: 0xf5c518,
      components: [
        { type: 10, content: "## <:logo:1472649971013783685> Apex Roleplay™ | Duty Tracker" },
        { type: 14, divider: true, spacing: 1 },
        {
          type: 10,
          content:
            "**```Επέλεξε On Duty αν είσαι σε υπηρεσία, Off Duty για να σταματήσεις, ή Leaderboard για να δεις την κατάταξη.```**",
        },
        { type: 14, divider: true, spacing: 1 },
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "duty_select",
              placeholder: "Επίλεξε την κατάστασή σου",
              options: [
                { label: "On Duty",      value: "on_duty",     description: "Είσαι σε υπηρεσία",          emoji: { name: "🟢" } },
                { label: "Off Duty",     value: "off_duty",    description: "Δεν είσαι σε υπηρεσία",     emoji: { name: "🔴" } },
                { label: "Leaderboard",  value: "leaderboard", description: "Δες τη θέση σου",           emoji: { name: "🏆" } },
              ],
            },
          ],
        },
        { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${Math.floor(Date.now()/1000)}:F>` },
      ],
    }],
  });
});

// ── Duty select menu interaction ──────────────────────────────────────────────
// (injected into the single unified interactionCreate — handled via the duty_select customId)

// ══════════════════════════════════════════════════════════════════════════════
//  TEMP VOICE CHANNEL SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild = newState.guild || oldState.guild;

  // ── User joins a join-to-create channel ───────────────────────────────────
  if (newState.channelId && TEMP_VOICE_CONFIG[newState.channelId]) {
    const cfg    = TEMP_VOICE_CONFIG[newState.channelId];
    const member = newState.member;
    if (!member) return;

    try {
      // Create private temp channel under the same category
      const parentCh = guild.channels.cache.get(newState.channelId);
      const newCh    = await guild.channels.create({
        name:   `${cfg.name} • ${member.displayName}`,
        type:   ChannelType.GuildVoice,
        parent: parentCh?.parentId || undefined,
        permissionOverwrites: [
          { id: guild.roles.everyone,   deny:  [PermissionFlagsBits.ViewChannel] },
          {
            id:    member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.MoveMembers,
            ],
          },
          ...(cfg.roleId ? [{
            id:    cfg.roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.ManageChannels,
            ],
          }] : []),
        ],
      });

      // Move member into the new channel
      await member.voice.setChannel(newCh).catch(() => {});
      tempVoiceChannels.set(newCh.id, member.id);

      // Log to the configured log channel
      if (cfg.logChannelId) {
        const logCh = guild.channels.cache.get(cfg.logChannelId);
        if (logCh) {
          const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("🔊 Temp Voice Created")
            .setThumbnail(THUMBNAIL_LOGO)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
            .addFields(
              { name: "👤 Owner",     value: `<@${member.id}> \`(${member.user.tag})\``, inline: false },
              { name: "🔊 Channel",   value: `${newCh.name} \`(${newCh.id})\``,           inline: true  },
              { name: "📋 Type",      value: cfg.name,                                     inline: true  },
              { name: "🕐 Created",   value: ts(),                                          inline: false },
            )
            .setFooter({ text: `${guild.name} - Temp Voice`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
            .setTimestamp();
          await logCh.send({ embeds: [embed] }).catch(() => {});
        }
      }

      console.log(`[TempVoice] ✅ Created ${newCh.name} for ${member.user.tag}`);
    } catch (e) {
      console.error("[TempVoice] Create error:", e.message);
    }
  }

  // ── User leaves — delete empty temp channel ───────────────────────────────
  if (oldState.channelId && tempVoiceChannels.has(oldState.channelId)) {
    const channel = guild.channels.cache.get(oldState.channelId);
    if (!channel) { tempVoiceChannels.delete(oldState.channelId); return; }

    // Only delete if empty
    if (channel.members.size === 0) {
      const ownerId = tempVoiceChannels.get(oldState.channelId);
      tempVoiceChannels.delete(oldState.channelId);

      // Find config for logging
      const cfgEntry = Object.values(TEMP_VOICE_CONFIG).find(
        (c) => channel.name.startsWith(c.name)
      );

      await channel.delete("Temp voice empty").catch(() => {});

      if (cfgEntry?.logChannelId) {
        const logCh = guild.channels.cache.get(cfgEntry.logChannelId);
        if (logCh) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("🔇 Temp Voice Deleted")
            .setThumbnail(THUMBNAIL_LOGO)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) || undefined })
            .addFields(
              { name: "👤 Was Owner",  value: `<@${ownerId}>`,     inline: true  },
              { name: "🔊 Channel",    value: channel.name,          inline: true  },
              { name: "🕐 Deleted",    value: ts(),                  inline: false },
            )
            .setFooter({ text: `${guild.name} - Temp Voice`, iconURL: guild.iconURL({ dynamic: true }) || undefined })
            .setTimestamp();
          await logCh.send({ embeds: [embed] }).catch(() => {});
        }
      }

      console.log(`[TempVoice] 🗑️ Deleted empty channel: ${channel.name}`);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DATABASES
// ─────────────────────────────────────────────────────────────────────────────
const inviteDB   = new sqlite3(path.join(__dirname, "invites.db"));
const giveawayDB = new sqlite3(path.join(__dirname, "giveaways.db"));

inviteDB.exec(`
  CREATE TABLE IF NOT EXISTS invites (
    guild_id    TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    invites     INTEGER DEFAULT 0,
    left_count  INTEGER DEFAULT 0,
    fake_count  INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS invite_map (
    guild_id    TEXT NOT NULL,
    code        TEXT NOT NULL,
    inviter_id  TEXT NOT NULL,
    uses        INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, code)
  );
`);

giveawayDB.exec(`
  CREATE TABLE IF NOT EXISTS giveaways (
    id          TEXT PRIMARY KEY,
    guild_id    TEXT NOT NULL,
    channel_id  TEXT NOT NULL,
    message_id  TEXT,
    host_id     TEXT NOT NULL,
    prize       TEXT NOT NULL,
    winners_count INTEGER DEFAULT 1,
    end_time    INTEGER NOT NULL,
    ended       INTEGER DEFAULT 0,
    entries     TEXT DEFAULT '[]',
    winner_ids  TEXT DEFAULT '[]',
    image_url   TEXT DEFAULT NULL
  );
`);

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function nowTs()  { return Math.floor(Date.now() / 1000); }
function genId()  { return Math.random().toString(36).slice(2, 10).toUpperCase(); }

function isAdmin(member) {
  return member?.permissions.has(PermissionFlagsBits.Administrator);
}
function isGiveawayManager(member) {
  return isAdmin(member) ||
    member?.roles.cache.has(GIVEAWAY_MANAGER_ROLE_ID) ||
    member?.roles.cache.has(STAFF_ROLE_ID);
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
        m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function parseDuration(str) {
  // e.g. "1d", "2h30m", "45m", "3600s"
  const regex = /(\d+)\s*([dhms])/gi;
  let total = 0, match;
  while ((match = regex.exec(str)) !== null) {
    const n = parseInt(match[1]);
    switch (match[2].toLowerCase()) {
      case "d": total += n * 86400000; break;
      case "h": total += n * 3600000;  break;
      case "m": total += n * 60000;    break;
      case "s": total += n * 1000;     break;
    }
  }
  return total;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INVITE DB HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function inviteGet(guildId, userId) {
  return inviteDB.prepare(
    "SELECT * FROM invites WHERE guild_id = ? AND user_id = ?"
  ).get(guildId, userId);
}

function inviteAdd(guildId, userId, delta) {
  inviteDB.prepare(`
    INSERT INTO invites (guild_id, user_id, invites)
    VALUES (?, ?, ?)
    ON CONFLICT(guild_id, user_id) DO UPDATE SET invites = invites + ?
  `).run(guildId, userId, Math.max(0, delta), delta);
}

function inviteLeft(guildId, userId) {
  inviteDB.prepare(`
    INSERT INTO invites (guild_id, user_id, left_count)
    VALUES (?, ?, 1)
    ON CONFLICT(guild_id, user_id) DO UPDATE SET left_count = left_count + 1
  `).run(guildId, userId);
}

function inviteLeaderboard(guildId) {
  return inviteDB.prepare(`
    SELECT user_id, invites, left_count, fake_count
    FROM invites
    WHERE guild_id = ?
    ORDER BY (invites - left_count - fake_count) DESC
    LIMIT 10
  `).all(guildId);
}

function inviteMapSet(guildId, code, inviterId, uses) {
  inviteDB.prepare(`
    INSERT INTO invite_map (guild_id, code, inviter_id, uses)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id, code) DO UPDATE SET inviter_id = ?, uses = ?
  `).run(guildId, code, inviterId, uses, inviterId, uses);
}

function inviteMapGet(guildId, code) {
  return inviteDB.prepare(
    "SELECT * FROM invite_map WHERE guild_id = ? AND code = ?"
  ).get(guildId, code);
}

// ─────────────────────────────────────────────────────────────────────────────
//  GIVEAWAY DB HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function gwCreate(data) {
  giveawayDB.prepare(`
    INSERT INTO giveaways
      (id, guild_id, channel_id, host_id, prize, winners_count, end_time, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.guildId, data.channelId, data.hostId, data.prize,
         data.winnersCount, data.endTime, data.imageUrl || null);
}

function gwSetMessage(id, messageId) {
  giveawayDB.prepare("UPDATE giveaways SET message_id = ? WHERE id = ?").run(messageId, id);
}

function gwGet(id) {
  const row = giveawayDB.prepare("SELECT * FROM giveaways WHERE id = ?").get(id);
  if (!row) return null;
  row.entries  = JSON.parse(row.entries  || "[]");
  row.winner_ids = JSON.parse(row.winner_ids || "[]");
  return row;
}

function gwGetByMessage(messageId) {
  const row = giveawayDB.prepare("SELECT * FROM giveaways WHERE message_id = ?").get(messageId);
  if (!row) return null;
  row.entries    = JSON.parse(row.entries    || "[]");
  row.winner_ids = JSON.parse(row.winner_ids || "[]");
  return row;
}

function gwActive(guildId) {
  return giveawayDB.prepare(
    "SELECT * FROM giveaways WHERE guild_id = ? AND ended = 0 ORDER BY end_time ASC"
  ).all(guildId).map((r) => ({ ...r, entries: JSON.parse(r.entries || "[]"), winner_ids: JSON.parse(r.winner_ids || "[]") }));
}

function gwAddEntry(id, userId) {
  const row = gwGet(id);
  if (!row || row.ended) return false;
  if (row.entries.includes(userId)) return false;
  row.entries.push(userId);
  giveawayDB.prepare("UPDATE giveaways SET entries = ? WHERE id = ?")
    .run(JSON.stringify(row.entries), id);
  return true;
}

function gwRemoveEntry(id, userId) {
  const row = gwGet(id);
  if (!row) return false;
  row.entries = row.entries.filter((e) => e !== userId);
  giveawayDB.prepare("UPDATE giveaways SET entries = ? WHERE id = ?")
    .run(JSON.stringify(row.entries), id);
  return true;
}

function gwEnd(id, winnerIds) {
  giveawayDB.prepare(
    "UPDATE giveaways SET ended = 1, winner_ids = ? WHERE id = ?"
  ).run(JSON.stringify(winnerIds), id);
}

function gwDelete(id) {
  giveawayDB.prepare("DELETE FROM giveaways WHERE id = ?").run(id);
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT V2 BUILDERS — INVITES
// ─────────────────────────────────────────────────────────────────────────────
function cv2_InviteStats(user, data, rank) {
  const total = (data?.invites || 0) - (data?.left_count || 0) - (data?.fake_count || 0);
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: 0xf5c518,
      components: [
        {
          type: 9,
          components: [{
            type: 10,
            content:
              `## <:logo:1472649971013783685> Invite Stats\n` +
              `> 👤 **User:** <@${user.id}> \`(${user.tag})\`\n` +
              `> 📨 **Total Invites:** \`${data?.invites || 0}\`\n` +
              `> ✅ **Net Invites:** \`${Math.max(0, total)}\`\n` +
              `> 🚪 **Left:** \`${data?.left_count || 0}\`\n` +
              `> 🚫 **Fake:** \`${data?.fake_count || 0}\`\n` +
              `> 🏆 **Leaderboard Rank:** \`${rank ? `#${rank}` : "N/A"}\`\n` +
              `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>`,
          }],
          accessory: { type: 11, media: { url: user.displayAvatarURL({ extension: "png", size: 256 }) } },
        },
      ],
    }],
  };
}

function cv2_InviteLB(rows) {
  const medals = ["🥇", "🥈", "🥉"];
  const lines  = rows.length
    ? rows.map((r, i) => {
        const net = Math.max(0, r.invites - r.left_count - r.fake_count);
        const m   = i < 3 ? medals[i] : `#${i + 1}`;
        return `${m} <@${r.user_id}> — **${net}** invites (\`+${r.invites}\` / \`-${r.left_count}\` left / \`-${r.fake_count}\` fake)`;
      }).join("\n")
    : "*Δεν υπάρχουν δεδομένα ακόμα.*";

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: 0xf5c518,
      components: [
        { type: 10, content: "## <:logo:1472649971013783685> Apex Roleplay™ | Invite Leaderboard" },
        { type: 12, items: [{ media: { url: SERVER_BANNER } }] },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: lines },
        { type: 14, divider: true, spacing: 0 },
        { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>` },
      ],
    }],
  };
}

function cv2_InviteLog(inviter, newMember, invites) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: 0x22c55e,
      components: [{
        type: 10,
        content:
          `## 📨 New Member Invited\n` +
          `> 👤 **Member:** <@${newMember.id}> \`(${newMember.user.tag})\`\n` +
          `> 📩 **Invited By:** <@${inviter.id}> \`(${inviter.tag})\`\n` +
          `> 📊 **Inviter Total:** \`${invites}\` invites\n` +
          `> ⏰ <t:${nowTs()}:F>\n` +
          `-# <:logo:1472649971013783685> Apex Roleplay™ Invite Tracker`,
      }],
    }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT V2 BUILDERS — GIVEAWAYS
// ─────────────────────────────────────────────────────────────────────────────
function cv2_GiveawayPanel(gw) {
  const timeLeft = gw.end_time - nowTs();
  const ended    = gw.ended === 1;
  const entries  = gw.entries?.length ?? 0;
  const accent   = ended ? 0xED4245 : 0xf5c518;

  const imageComp = gw.image_url
    ? [{ type: 12, items: [{ media: { url: gw.image_url } }] }]
    : [{ type: 12, items: [{ media: { url: SERVER_BANNER } }] }];

  const statusLine = ended
    ? `> 🔴 **Status:** ENDED`
    : `> 🟢 **Ends:** <t:${gw.end_time}:R> \`(<t:${gw.end_time}:F>)\``;

  const winnerLine = ended && gw.winner_ids?.length
    ? `> 🏆 **Winner${gw.winner_ids.length > 1 ? "s" : ""}:** ${gw.winner_ids.map((id) => `<@${id}>`).join(", ")}\n`
    : "";

  const buttons = ended
    ? []
    : [{
        type: 1,
        components: [
          { type: 2, style: ButtonStyle.Success,   label: "Enter",     emoji: { name: "🎉" }, custom_id: `gw_enter_${gw.id}`    },
          { type: 2, style: ButtonStyle.Danger,    label: "Leave",     emoji: { name: "🚪" }, custom_id: `gw_leave_${gw.id}`    },
          { type: 2, style: ButtonStyle.Secondary, label: "Entries",   emoji: { name: "📊" }, custom_id: `gw_entries_${gw.id}`  },
        ],
      }];

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      accent_color: accent,
      components: [
        { type: 10, content: `## <:logo:1472649971013783685> GIVEAWAY` },
        ...imageComp,
        { type: 14, divider: true, spacing: 1 },
        {
          type: 10,
          content:
            `### 🎁 ${gw.prize}\n\n` +
            `> 🎟️ **Entries:** \`${entries}\`\n` +
            `> 🏆 **Winners:** \`${gw.winners_count}\`\n` +
            `> 👤 **Hosted By:** <@${gw.host_id}>\n` +
            `> 🆔 **Giveaway ID:** \`${gw.id}\`\n` +
            statusLine + "\n" +
            winnerLine,
        },
        { type: 14, divider: true, spacing: 1 },
        ...buttons,
        {
          type: 10,
          content: ended
            ? `-# 🎊 Giveaway Ended | <:logo:1472649971013783685> Apex Roleplay™`
            : `-# 🎉 Press Enter to join! | <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>`,
        },
      ],
    }],
  };
}

function cv2_GiveawayEnterEphemeral(gw) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0x22c55e,
      components: [{
        type: 10,
        content:
          `## ✅ Μπήκες στο Giveaway!\n` +
          `Έχεις μπει στο giveaway για **${gw.prize}**.\n` +
          `Καλή τύχη! 🍀\n` +
          `-# <:logo:1472649971013783685> Apex Roleplay™`,
      }],
    }],
  };
}

function cv2_GiveawayLeaveEphemeral(gw) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xED4245,
      components: [{
        type: 10,
        content:
          `## 🚪 Βγήκες από το Giveaway\n` +
          `Βγήκες από το giveaway για **${gw.prize}**.\n` +
          `-# <:logo:1472649971013783685> Apex Roleplay™`,
      }],
    }],
  };
}

function cv2_GiveawayEntriesEphemeral(gw) {
  const entries = gw.entries || [];
  const sample  = entries.slice(0, 20).map((id) => `<@${id}>`).join(", ") || "*Κανείς ακόμα*";
  const more    = entries.length > 20 ? `\n*...και ${entries.length - 20} ακόμα*` : "";
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xf5c518,
      components: [{
        type: 10,
        content:
          `## 📊 Entries — ${gw.prize}\n` +
          `**Συνολικές εγγραφές:** \`${entries.length}\`\n\n` +
          sample + more + "\n" +
          `-# <:logo:1472649971013783685> Apex Roleplay™`,
      }],
    }],
  };
}

function cv2_GiveawayAlreadyIn() {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xf59e0b,
      components: [{ type: 10, content: `## ⚠️ Ήδη έχεις μπει!\nΕίσαι ήδη στο giveaway. Πάτα **Leave** αν θέλεις να αποχωρήσεις.\n-# <:logo:1472649971013783685> Apex Roleplay™` }],
    }],
  };
}

function cv2_GiveawayNotIn() {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [{
      type: 17, accent_color: 0xf59e0b,
      components: [{ type: 10, content: `## ⚠️ Δεν έχεις μπει!\nΔεν είσαι στο giveaway αυτό.\n-# <:logo:1472649971013783685> Apex Roleplay™` }],
    }],
  };
}

function cv2_GiveawayWinnerAnnouncement(gw, winners) {
  const wList = winners.map((id) => `<@${id}>`).join(", ");
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xf5c518,
      components: [
        { type: 10, content: `## 🎊 Giveaway Winners!` },
        { type: 14, divider: true, spacing: 1 },
        {
          type: 10,
          content:
            `### 🎁 ${gw.prize}\n\n` +
            `🏆 **Winner${winners.length > 1 ? "s" : ""}:** ${wList}\n\n` +
            `Συγχαρητήρια! Επικοινωνήστε με <@${gw.host_id}> για να παραλάβετε το βραβείο σας!\n` +
            `-# 🆔 \`${gw.id}\` | <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>`,
        },
      ],
    }],
  };
}

function cv2_GiveawayNoWinner(gw) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xED4245,
      components: [{
        type: 10,
        content:
          `## ❌ Κανένας νικητής\n` +
          `Το giveaway για **${gw.prize}** τελείωσε χωρίς εγγεγραμμένους.\n` +
          `-# <:logo:1472649971013783685> Apex Roleplay™`,
      }],
    }],
  };
}

function cv2_GiveawayList(rows, guild) {
  if (!rows.length) {
    return {
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17, accent_color: 0xED4245,
        components: [{ type: 10, content: `## ❌ Δεν υπάρχουν ενεργά Giveaways\n-# <:logo:1472649971013783685> Apex Roleplay™` }],
      }],
    };
  }
  const lines = rows.map((gw) =>
    `> 🎁 **${gw.prize}** | 🏆 \`${gw.winners_count}\` winners | 🎟️ \`${gw.entries.length}\` entries | Ends <t:${gw.end_time}:R> | ID: \`${gw.id}\``
  ).join("\n");
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17, accent_color: 0xf5c518,
      components: [
        { type: 10, content: `## <:logo:1472649971013783685> Active Giveaways` },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: lines },
        { type: 14, divider: true, spacing: 0 },
        { type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>` },
      ],
    }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  GIVEAWAY END LOGIC
// ─────────────────────────────────────────────────────────────────────────────
async function endGiveaway(client, gwId, reroll = false) {
  const gw = gwGet(gwId);
  if (!gw) return;
  if (gw.ended && !reroll) return;

  const guild   = client.guilds.cache.get(gw.guild_id);
  const channel = guild?.channels.cache.get(gw.channel_id);
  if (!channel) return;

  const pool = gw.entries.filter((id) => id !== gw.host_id);

  let winners = [];
  if (pool.length > 0) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    winners = shuffled.slice(0, Math.min(gw.winners_count, pool.length));
  }

  gwEnd(gwId, winners);
  const updatedGw = { ...gw, ended: 1, winner_ids: winners };

  // Edit original panel message
  if (gw.message_id) {
    try {
      const msg = await channel.messages.fetch(gw.message_id);
      await msg.edit(cv2_GiveawayPanel(updatedGw));
    } catch {}
  }

  // Send winner announcement
  if (winners.length > 0) {
    await channel.send({
      ...cv2_GiveawayWinnerAnnouncement(gw, winners),
      content: winners.map((id) => `<@${id}>`).join(" "),
    }).catch(() => {});
  } else {
    await channel.send(cv2_GiveawayNoWinner(gw)).catch(() => {});
  }

  // Log
  const logCh = client.channels.cache.get(GIVEAWAY_LOG_CHANNEL_ID);
  if (logCh) {
    await logCh.send({
      flags: MessageFlags.IsComponentsV2,
      components: [{
        type: 17, accent_color: reroll ? 0xf59e0b : 0x22c55e,
        components: [{
          type: 10,
          content:
            `## ${reroll ? "🔄 Giveaway Rerolled" : "🏁 Giveaway Ended"}\n` +
            `> 🎁 **Prize:** ${gw.prize}\n` +
            `> 🏆 **Winners:** ${winners.length ? winners.map((id) => `<@${id}>`).join(", ") : "None"}\n` +
            `> 🎟️ **Total Entries:** \`${pool.length}\`\n` +
            `> 👤 **Host:** <@${gw.host_id}>\n` +
            `> 🆔 \`${gwId}\`\n` +
            `-# <:logo:1472649971013783685> Apex Roleplay™ • <t:${nowTs()}:F>`,
        }],
      }],
    }).catch(() => {});
  }

  return winners;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GIVEAWAY TIMER LOOP
// ─────────────────────────────────────────────────────────────────────────────
function startGiveawayTimer(client) {
  setInterval(async () => {
    const now = nowTs();
    // Pull all guilds the bot is in
    for (const guild of client.guilds.cache.values()) {
      const actives = gwActive(guild.id);
      for (const gw of actives) {
        if (gw.end_time <= now) {
          await endGiveaway(client, gw.id);
        }
      }
    }
  }, 15_000); // check every 15 seconds
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODULE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
// ── Invite & Giveaway System ──────────────────────────────────────────────
(function() {

  // ══════════════════════════════════════════════════════════════════════════
  //  INVITE CACHE  — snapshot all invites on ready
  // ══════════════════════════════════════════════════════════════════════════
  client.on("ready", async () => {
    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        invites.forEach((inv) => {
          if (inv.inviter) {
            inviteMapSet(guild.id, inv.code, inv.inviter.id, inv.uses);
          }
        });
      } catch {}
    }
    console.log("[InviteTracker] ✅ Invite cache loaded");
    startGiveawayTimer(client);
    console.log("[Giveaway] ✅ Giveaway timer started");
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  INVITE CREATED/DELETED — keep map fresh
  // ══════════════════════════════════════════════════════════════════════════
  client.on("inviteCreate", (invite) => {
    if (invite.inviter) {
      inviteMapSet(invite.guild.id, invite.code, invite.inviter.id, invite.uses ?? 0);
    }
  });

  client.on("inviteDelete", (invite) => {
    inviteDB.prepare("DELETE FROM invite_map WHERE guild_id = ? AND code = ?")
      .run(invite.guild.id, invite.code);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  MEMBER JOIN — detect who invited
  // ══════════════════════════════════════════════════════════════════════════
  client.on("guildMemberAdd", async (member) => {
    if (member.user.bot) return;
    const guild = member.guild;

    try {
      const newInvites  = await guild.invites.fetch();
      let inviterId     = null;
      let usedCode      = null;

      for (const [code, inv] of newInvites) {
        const cached = inviteMapGet(guild.id, code);
        if (cached && inv.uses > cached.uses) {
          inviterId = cached.inviter_id;
          usedCode  = code;
          inviteMapSet(guild.id, code, cached.inviter_id, inv.uses);
          break;
        }
      }

      // Refresh map
      newInvites.forEach((inv) => {
        if (inv.inviter) inviteMapSet(guild.id, inv.code, inv.inviter.id, inv.uses);
      });

      if (inviterId && inviterId !== member.id) {
        inviteAdd(guild.id, inviterId, 1);
        const data    = inviteGet(guild.id, inviterId);
        const inviter = await client.users.fetch(inviterId).catch(() => null);

        if (inviter) {
          const logCh = client.channels.cache.get(INVITE_LOG_CHANNEL_ID);
          if (logCh) {
            await logCh.send(cv2_InviteLog(inviter, member, data?.invites || 1)).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.error("[InviteTracker] guildMemberAdd:", e.message);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  MEMBER LEAVE — track "left" count against the person who invited them
  // ══════════════════════════════════════════════════════════════════════════
  // Note: We can't easily look up WHO invited them without storing a
  // member→inviter map. We track the fact that a member left globally.
  // Full per-user left tracking would require an extra table — add below if needed.

  // ══════════════════════════════════════════════════════════════════════════
  //  PREFIX COMMANDS
  // ══════════════════════════════════════════════════════════════════════════
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith("!")) return;

    const args = message.content.slice(1).trim().split(/\s+/);
    const cmd  = args.shift().toLowerCase();

    // ── !invites [@user] ───────────────────────────────────────────────────
    if (cmd === "invites") {
      const target = message.mentions.members.first() || message.member;
      const data   = inviteGet(message.guild.id, target.id);

      // Calculate rank
      const lb   = inviteLeaderboard(message.guild.id);
      const rank = lb.findIndex((r) => r.user_id === target.id) + 1 || null;

      await message.reply(cv2_InviteStats(target.user, data, rank));
      return;
    }

    // ── !lb (invite leaderboard) ────────────────────────────────────────────
    if (cmd === "lb") {
      const rows = inviteLeaderboard(message.guild.id);
      await message.reply(cv2_InviteLB(rows));
      return;
    }

    // ── !resetinvites @user ─────────────────────────────────────────────────
    if (cmd === "resetinvites") {
      if (!isAdmin(message.member)) return message.reply("❌ Χρειάζεσαι **Administrator** permissions.");
      const target = message.mentions.members.first();
      if (!target) return message.reply("❌ Usage: `!resetinvites @user`");
      inviteDB.prepare("DELETE FROM invites WHERE guild_id = ? AND user_id = ?")
        .run(message.guild.id, target.id);
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [{
          type: 17, accent_color: 0xf5c518,
          components: [{ type: 10, content: `## ✅ Reset\nΤα invites του <@${target.id}> μηδενίστηκαν.\n-# <:logo:1472649971013783685> Apex Roleplay™` }],
        }],
      });
      return;
    }

    // ── !addInvites @user <amount> ─────────────────────────────────────────
    if (cmd === "addinvites") {
      if (!isAdmin(message.member)) return message.reply("❌ Χρειάζεσαι **Administrator** permissions.");
      const target = message.mentions.members.first();
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return message.reply("❌ Usage: `!addinvites @user <amount>`");
      inviteAdd(message.guild.id, target.id, amount);
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [{
          type: 17, accent_color: 0x22c55e,
          components: [{ type: 10, content: `## ✅ Added\nΠροστέθηκαν **${amount}** invites στον <@${target.id}>.\n-# <:logo:1472649971013783685> Apex Roleplay™` }],
        }],
      });
      return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GIVEAWAY COMMANDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ── !gcreate ───────────────────────────────────────────────────────────
    // Syntax: !gcreate <duration> <winners> <#channel> | <prize>
    // Example: !gcreate 1d 2 #giveaways | Nitro Boost x2
    if (cmd === "gcreate") {
      if (!isGiveawayManager(message.member)) return message.reply("❌ Δεν έχεις δικαίωμα να δημιουργήσεις giveaway.");

      const full = args.join(" ");
      if (!full.includes("|")) {
        return message.reply(
          "❌ Usage: `!gcreate <duration> <winners> <#channel> | <prize>`\n" +
          "Example: `!gcreate 1d 2 #giveaways | Nitro Boost`"
        );
      }

      const [meta, ...prizeParts] = full.split("|");
      const prize   = prizeParts.join("|").trim();
      const metaArr = meta.trim().split(/\s+/);

      const durationStr   = metaArr[0];
      const winnersCount  = parseInt(metaArr[1]) || 1;
      const channelMention = message.mentions.channels.first();

      if (!durationStr || !prize) {
        return message.reply("❌ Συμπλήρωσε duration, winners, channel και prize.");
      }

      const durationMs = parseDuration(durationStr);
      if (durationMs <= 0) {
        return message.reply("❌ Μη έγκυρη διάρκεια. Χρησιμοποίησε: `1d`, `2h30m`, `45m`, `3600s`");
      }

      const targetChannel = channelMention || message.channel;
      const endTime       = nowTs() + Math.floor(durationMs / 1000);
      const gwId          = genId();

      gwCreate({
        id: gwId, guildId: message.guild.id, channelId: targetChannel.id,
        hostId: message.author.id, prize, winnersCount, endTime,
        imageUrl: null,
      });

      // Send panel
      const gw      = gwGet(gwId);
      const panelMsg = await targetChannel.send(cv2_GiveawayPanel(gw));
      gwSetMessage(gwId, panelMsg.id);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [{
          type: 17, accent_color: 0x22c55e,
          components: [{
            type: 10,
            content:
              `## ✅ Giveaway Δημιουργήθηκε!\n` +
              `> 🎁 **Prize:** ${prize}\n` +
              `> 🏆 **Winners:** \`${winnersCount}\`\n` +
              `> ⏰ **Ends:** <t:${endTime}:R>\n` +
              `> 💬 **Channel:** ${targetChannel}\n` +
              `> 🆔 **ID:** \`${gwId}\`\n` +
              `-# <:logo:1472649971013783685> Apex Roleplay™`,
          }],
        }],
      });
      return;
    }

    // ── !gend <id> ─────────────────────────────────────────────────────────
    if (cmd === "gend") {
      if (!isGiveawayManager(message.member)) return message.reply("❌ Δεν έχεις δικαίωμα.");
      const gwId = args[0];
      if (!gwId) return message.reply("❌ Usage: `!gend <giveaway_id>`");
      const gw = gwGet(gwId);
      if (!gw || gw.guild_id !== message.guild.id) return message.reply("❌ Giveaway δεν βρέθηκε.");
      if (gw.ended) return message.reply("⚠️ Αυτό το giveaway έχει ήδη τελειώσει.");
      const winners = await endGiveaway(client, gwId);
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [{
          type: 17, accent_color: 0x22c55e,
          components: [{ type: 10, content: `## 🏁 Giveaway Τέλος!\nΝικητές: ${winners?.length ? winners.map((id) => `<@${id}>`).join(", ") : "Κανένας"}\n-# ID: \`${gwId}\`` }],
        }],
      });
      return;
    }

    // ── !greroll <id> ──────────────────────────────────────────────────────
    if (cmd === "greroll") {
      if (!isGiveawayManager(message.member)) return message.reply("❌ Δεν έχεις δικαίωμα.");
      const gwId = args[0];
      if (!gwId) return message.reply("❌ Usage: `!greroll <giveaway_id>`");
      const gw = gwGet(gwId);
      if (!gw || gw.guild_id !== message.guild.id) return message.reply("❌ Giveaway δεν βρέθηκε.");
      if (!gw.ended) {
        return message.reply("⚠️ Το giveaway δεν έχει τελειώσει ακόμα. Χρησιμοποίησε `!gend` πρώτα.");
      }
      // restore ended=0 temporarily so endGiveaway logic picks new winners
      giveawayDB.prepare("UPDATE giveaways SET ended = 0 WHERE id = ?").run(gwId);
      const winners = await endGiveaway(client, gwId, true);
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [{
          type: 17, accent_color: 0xf59e0b,
          components: [{ type: 10, content: `## 🔄 Reroll!\nΝέοι νικητές: ${winners?.length ? winners.map((id) => `<@${id}>`).join(", ") : "Κανένας"}\n-# ID: \`${gwId}\`` }],
        }],
      });
      return;
    }

    // ── !gdelete <id> ──────────────────────────────────────────────────────
    if (cmd === "gdelete") {
      if (!isAdmin(message.member)) return message.reply("❌ Χρειάζεσαι **Administrator** permissions.");
      const gwId = args[0];
      if (!gwId) return message.reply("❌ Usage: `!gdelete <giveaway_id>`");
      const gw = gwGet(gwId);
      if (!gw || gw.guild_id !== message.guild.id) return message.reply("❌ Giveaway δεν βρέθηκε.");
      // Try to delete the panel message
      try {
        const ch  = message.guild.channels.cache.get(gw.channel_id);
        const msg = await ch?.messages.fetch(gw.message_id).catch(() => null);
        await msg?.delete().catch(() => {});
      } catch {}
      gwDelete(gwId);
      await message.reply(`✅ Giveaway \`${gwId}\` διαγράφηκε.`);
      return;
    }

    // ── !glist ─────────────────────────────────────────────────────────────
    if (cmd === "glist") {
      if (!isGiveawayManager(message.member)) return message.reply("❌ Δεν έχεις δικαίωμα.");
      const rows = gwActive(message.guild.id);
      await message.reply(cv2_GiveawayList(rows, message.guild));
      return;
    }

    // ── !gsetimage <id> <url> ──────────────────────────────────────────────
    if (cmd === "gsetimage") {
      if (!isGiveawayManager(message.member)) return message.reply("❌ Δεν έχεις δικαίωμα.");
      const gwId = args[0];
      const url  = args[1];
      if (!gwId || !url) return message.reply("❌ Usage: `!gsetimage <id> <image_url>`");
      const gw = gwGet(gwId);
      if (!gw || gw.guild_id !== message.guild.id) return message.reply("❌ Giveaway δεν βρέθηκε.");
      giveawayDB.prepare("UPDATE giveaways SET image_url = ? WHERE id = ?").run(url, gwId);
      // refresh the panel
      try {
        const ch  = message.guild.channels.cache.get(gw.channel_id);
        const msg = await ch?.messages.fetch(gw.message_id).catch(() => null);
        const updated = gwGet(gwId);
        await msg?.edit(cv2_GiveawayPanel(updated)).catch(() => {});
      } catch {}
      await message.reply(`✅ Image ενημερώθηκε για giveaway \`${gwId}\`.`);
      return;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  BUTTON INTERACTIONS — Giveaway
  // ══════════════════════════════════════════════════════════════════════════
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;

    // ── Enter ──────────────────────────────────────────────────────────────
    if (customId.startsWith("gw_enter_")) {
      const gwId = customId.slice("gw_enter_".length);
      const gw   = gwGet(gwId);
      if (!gw || gw.ended) {
        return interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [{
            type: 17, accent_color: 0xED4245,
            components: [{ type: 10, content: "## ❌ Αυτό το giveaway έχει λήξει!" }],
          }],
        });
      }
      if (gw.entries.includes(interaction.user.id)) {
        return interaction.reply(cv2_GiveawayAlreadyIn());
      }
      gwAddEntry(gwId, interaction.user.id);
      const updated = gwGet(gwId);
      // Update panel silently
      try { await interaction.message.edit(cv2_GiveawayPanel(updated)); } catch {}
      await interaction.reply(cv2_GiveawayEnterEphemeral(gw));
      return;
    }

    // ── Leave ──────────────────────────────────────────────────────────────
    if (customId.startsWith("gw_leave_")) {
      const gwId = customId.slice("gw_leave_".length);
      const gw   = gwGet(gwId);
      if (!gw || gw.ended) {
        return interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [{
            type: 17, accent_color: 0xED4245,
            components: [{ type: 10, content: "## ❌ Αυτό το giveaway έχει λήξει!" }],
          }],
        });
      }
      if (!gw.entries.includes(interaction.user.id)) {
        return interaction.reply(cv2_GiveawayNotIn());
      }
      gwRemoveEntry(gwId, interaction.user.id);
      const updated = gwGet(gwId);
      try { await interaction.message.edit(cv2_GiveawayPanel(updated)); } catch {}
      await interaction.reply(cv2_GiveawayLeaveEphemeral(gw));
      return;
    }

    // ── Entries ────────────────────────────────────────────────────────────
    if (customId.startsWith("gw_entries_")) {
      const gwId = customId.slice("gw_entries_".length);
      const gw   = gwGet(gwId);
      if (!gw) return interaction.reply({ flags: MessageFlags.Ephemeral, content: "❌ Giveaway δεν βρέθηκε." });
      await interaction.reply(cv2_GiveawayEntriesEphemeral(gw));
      return;
    }
  });

  console.log("[InviteTracker + Giveaway] ✅ Module registered");
})();

// ─────────────────────────────────────────────────────────────────────────────
//  ALL COMMANDS DATA
// ─────────────────────────────────────────────────────────────────────────────
const COMMAND_CATEGORIES = [
  {
    emoji: "🎫",
    title: "Ticket System",
    color: 0xf5c518,
    commands: [
      { cmd: "!ticket_menu",  perm: "Admin",  desc: "Στέλνει το ticket panel με dropdown επιλογής κατηγορίας στο κανάλι." },
    ],
    buttons: [
      { label: "🔒 Delete Ticket",  desc: "Κλείνει και διαγράφει το ticket — στέλνει transcript στο log." },
      { label: "🤝 Claim",          desc: "Το staff κάνει claim το ticket για να το αναλάβει." },
      { label: "🔔 Ping",           desc: "Κάνει ping τον χρήστη που άνοιξε το ticket." },
    ],
  },
  {
    emoji: "📋",
    title: "Staff Applications",
    color: 0xf5c518,
    commands: [
      { cmd: "!applications", perm: "Admin", desc: "Στέλνει το panel αιτήσεων (Staff, Anticheat, ΕΛ.ΑΣ, Ε.Κ.Α.Β, Δημαρχείο) στο κανάλι." },
    ],
    buttons: [
      { label: "✅ Αποδοχή", desc: "Reviewer αποδέχεται αίτηση — δίνει ρόλο & στέλνει DM." },
      { label: "❌ Απόρριψη", desc: "Reviewer απορρίπτει αίτηση — στέλνει DM στον αιτούντα." },
    ],
  },
  {
    emoji: "🔫",
    title: "Criminal Applications",
    color: 0xf5c518,
    commands: [
      { cmd: "!crimapps",       perm: "Admin", desc: "Στέλνει το Criminal Job application panel (Mafia / Cartel / Gang)." },
      { cmd: "!setinfochannel <id>", perm: "Admin", desc: "Στέλνει τα Info & Teams embeds σε συγκεκριμένο κανάλι." },
      { cmd: "!toggleteam <name>",   perm: "Admin", desc: "Ενεργοποιεί / απενεργοποιεί ένα criminal team (🟢/🔴)." },
      { cmd: "!teamstatus",          perm: "Admin", desc: "Δείχνει την τρέχουσα κατάσταση όλων των teams." },
    ],
  },
  {
    emoji: "📢",
    title: "Announcements",
    color: 0xf5c518,
    commands: [
      { cmd: "!say <message>",               perm: "Staff", desc: "Στέλνει ανακοίνωση με απλό κείμενο (Component V2 χρυσό style)." },
      { cmd: "!say2 <title> | <desc>",       perm: "Staff", desc: "Στέλνει ανακοίνωση με τίτλο + κείμενο + timestamp." },
      { cmd: "!say3 <title> | <desc>",       perm: "Staff", desc: "Στέλνει ανακοίνωση με logo, banner image, τίτλο + κείμενο." },
      { cmd: "!dmall <message>",             perm: "Admin", desc: "Στέλνει DM σε όλα τα μέλη (απλό κείμενο)." },
      { cmd: "!dmall2 <title> | <desc>",     perm: "Admin", desc: "Στέλνει πλούσιο Component V2 DM σε όλα τα μέλη." },
    ],
  },
  {
    emoji: "🛡️",
    title: "Moderation",
    color: 0xf5c518,
    commands: [
      { cmd: "!clear <1-100>",        perm: "Staff", desc: "Διαγράφει X μηνύματα στο τρέχον κανάλι (max 14 ημέρες)." },
      { cmd: "!lock [reason]",        perm: "Staff", desc: "Κλειδώνει το κανάλι — αποτρέπει μηνύματα από everyone." },
      { cmd: "!unlock [reason]",      perm: "Staff", desc: "Ξεκλειδώνει το κανάλι." },
      { cmd: "!nuke",                 perm: "Admin", desc: "Διαγράφει και ξαναδημιουργεί το κανάλι με ίδιες ρυθμίσεις." },
    ],
  },
  {
    emoji: "📊",
    title: "Logs Setup",
    color: 0xf5c518,
    commands: [
      { cmd: "!logs-setup",           perm: "Admin", desc: "Δημιουργεί αυτόματα όλα τα log κανάλια (join, ban, voice, κ.λπ.)." },
    ],
    note: "📋 **Αυτόματα Logs:** Join • Leave • Kick • Ban • Unban • Messages (sent/edited/deleted) • Voice • Roles • Nicknames • Channels • Commands • Clear",
  },
  {
    emoji: "🔒",
    title: "Security System",
    color: 0xf5c518,
    commands: [
      { cmd: "!securitylogssetup",                   perm: "Admin", desc: "Δημιουργεί τα security log κανάλια και ενεργοποιεί το σύστημα." },
      { cmd: "!security <module> <on/off>",           perm: "Admin", desc: "Ενεργοποιεί / απενεργοποιεί module: `antilink` `antispam` `antibot` `antiwebhook` `antialt` `antichannel` `antirole` `antiban` `antikick`" },
      { cmd: "!secsettings",                          perm: "Admin", desc: "Δείχνει τις τρέχουσες ρυθμίσεις security (modules + whitelist)." },
      { cmd: "!secwl role add/remove @role",          perm: "Admin", desc: "Προσθέτει / αφαιρεί ρόλο από whitelist (bypass όλων)." },
      { cmd: "!secwl user add/remove @user",          perm: "Admin", desc: "Προσθέτει / αφαιρεί user από whitelist." },
      { cmd: "!secwl channel add/remove #channel",    perm: "Admin", desc: "Whitelist κανάλι — bypass antilink & antispam." },
      { cmd: "!secwl crimcat <categoryId>",           perm: "Admin", desc: "Ορίζει criminal category — links πάντα επιτρεπτά εκεί." },
      { cmd: "!secwl altdays <days>",                 perm: "Admin", desc: "Ελάχιστη ηλικία λογαριασμού για antialt (0 = off)." },
    ],
  },
  {
    emoji: "🕐",
    title: "Duty Tracker",
    color: 0xf5c518,
    commands: [
      { cmd: "!setupduty",          perm: "Admin", desc: "Στέλνει το Duty panel (On Duty / Off Duty / Leaderboard dropdown)." },
      { cmd: "!resetduty @user",    perm: "Admin", desc: "Μηδενίζει τα duty δεδομένα συγκεκριμένου χρήστη." },
    ],
    buttons: [
      { label: "🟢 On Duty",     desc: "Ξεκινά καταγραφή χρόνου — πρέπει να είσαι στο Duty VC." },
      { label: "🔴 Off Duty",    desc: "Σταματά καταγραφή και εμφανίζει χρόνο βάρδιας." },
      { label: "🏆 Leaderboard", desc: "Δείχνει τop 10 staff με περισσότερο duty time." },
    ],
  },
  {
    emoji: "📨",
    title: "Invite Tracker",
    color: 0xf5c518,
    commands: [
      { cmd: "!invites [@user]",         perm: "Everyone", desc: "Δείχνει invite stats (total, net, left, fake, rank) για εσένα ή άλλον." },
      { cmd: "!lb",                      perm: "Everyone", desc: "Invite leaderboard — top 10 χρήστες με τα περισσότερα invites." },
      { cmd: "!addinvites @user <n>",    perm: "Admin",    desc: "Χειροκίνητη προσθήκη invites σε χρήστη." },
      { cmd: "!resetinvites @user",      perm: "Admin",    desc: "Μηδενίζει τα invite δεδομένα χρήστη." },
    ],
  },
  {
    emoji: "🎉",
    title: "Giveaway System",
    color: 0xf5c518,
    commands: [
      { cmd: "!gcreate <dur> <winners> <#ch> | <prize>", perm: "Staff", desc: "Δημιουργεί giveaway. Π.χ. `!gcreate 1d 2 #giveaways | Nitro Boost`\nΔιάρκεια: `1d` `2h30m` `45m` `3600s`" },
      { cmd: "!gend <id>",       perm: "Staff", desc: "Τερματίζει αναγκαστικά ένα giveaway και κληρώνει νικητές." },
      { cmd: "!greroll <id>",    perm: "Staff", desc: "Ξανακληρώνει νέους νικητές από τα ίδια entries." },
      { cmd: "!gdelete <id>",    perm: "Admin", desc: "Διαγράφει giveaway και το panel μήνυμά του." },
      { cmd: "!glist",           perm: "Staff", desc: "Λίστα όλων των ενεργών giveaways." },
      { cmd: "!gsetimage <id> <url>", perm: "Staff", desc: "Ορίζει custom banner image στο giveaway panel." },
    ],
    buttons: [
      { label: "🎉 Enter",   desc: "Μπαίνεις στην κλήρωση. Ο μετρητής entries ενημερώνεται αυτόματα." },
      { label: "🚪 Leave",   desc: "Αποχωρείς από την κλήρωση." },
      { label: "📊 Entries", desc: "Βλέπεις πόσοι και ποιοι έχουν μπει (ephemeral)." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  PERMISSION BADGE
// ─────────────────────────────────────────────────────────────────────────────
function permBadge(perm) {
  switch (perm) {
    case "Admin":    return "🔴 Admin";
    case "Staff":    return "🟡 Staff";
    case "Everyone": return "🟢 Everyone";
    default:         return `⚪ ${perm}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUILD COMPONENT V2 PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────
function buildCommandsPayloads() {
  const payloads = [];

  // Message 1: Header + categories 0-3
  const msg1 = [
    { type: 10, content: `## <:logo:1472649971013783685> Apex Roleplay™ | Bot Commands\n**\`\`\`Παρακάτω βρίσκονται όλες οι εντολές του bot, οργανωμένες ανά κατηγορία.\`\`\`**` },
    { type: 12, items: [{ media: { url: SERVER_BANNER } }] },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: `### 🔑 Permissions\n> 🔴 **Admin** — Χρειάζεται Administrator\n> 🟡 **Staff** — Χρειάζεται Staff / Manager ρόλο\n> 🟢 **Everyone** — Όλοι μπορούν να χρησιμοποιήσουν` },
    { type: 14, divider: true, spacing: 1 },
  ];
  for (let i = 0; i <= 3; i++) {
    const cat = COMMAND_CATEGORIES[i];
    msg1.push({ type: 10, content: `### ${cat.emoji} ${cat.title}` });
    msg1.push({ type: 10, content: cat.commands.map((c) => `> \`${c.cmd}\` — ${permBadge(c.perm)}\n> ↳ ${c.desc}`).join("\n>\n") });
    if (cat.buttons?.length) msg1.push({ type: 10, content: `**Buttons:**\n${cat.buttons.map((b) => `> **${b.label}** — ${b.desc}`).join("\n")}` });
    if (cat.note) msg1.push({ type: 10, content: cat.note });
    if (i < 3) msg1.push({ type: 14, divider: true, spacing: 1 });
  }
  payloads.push({ flags: MessageFlags.IsComponentsV2, components: [{ type: 17, accent_color: 0xf5c518, components: msg1 }] });

  // Message 2: Categories 4-7
  const msg2 = [];
  for (let i = 4; i <= 7; i++) {
    const cat = COMMAND_CATEGORIES[i];
    if (i > 4) msg2.push({ type: 14, divider: true, spacing: 1 });
    msg2.push({ type: 10, content: `### ${cat.emoji} ${cat.title}` });
    msg2.push({ type: 10, content: cat.commands.map((c) => `> \`${c.cmd}\` — ${permBadge(c.perm)}\n> ↳ ${c.desc}`).join("\n>\n") });
    if (cat.buttons?.length) msg2.push({ type: 10, content: `**Buttons:**\n${cat.buttons.map((b) => `> **${b.label}** — ${b.desc}`).join("\n")}` });
    if (cat.note) msg2.push({ type: 10, content: cat.note });
  }
  payloads.push({ flags: MessageFlags.IsComponentsV2, components: [{ type: 17, accent_color: 0xf5c518, components: msg2 }] });

  // Message 3: Categories 8-9 + footer
  const msg3 = [];
  for (let i = 8; i <= 9; i++) {
    const cat = COMMAND_CATEGORIES[i];
    if (i > 8) msg3.push({ type: 14, divider: true, spacing: 1 });
    msg3.push({ type: 10, content: `### ${cat.emoji} ${cat.title}` });
    msg3.push({ type: 10, content: cat.commands.map((c) => `> \`${c.cmd}\` — ${permBadge(c.perm)}\n> ↳ ${c.desc}`).join("\n>\n") });
    if (cat.buttons?.length) msg3.push({ type: 10, content: `**Buttons:**\n${cat.buttons.map((b) => `> **${b.label}** — ${b.desc}`).join("\n")}` });
    if (cat.note) msg3.push({ type: 10, content: cat.note });
  }
  msg3.push({ type: 14, divider: true, spacing: 0 });
  msg3.push({ type: 10, content: `-# <:logo:1472649971013783685> Apex Roleplay™ Bot | <t:${nowTs()}:F>` });
  payloads.push({ flags: MessageFlags.IsComponentsV2, components: [{ type: 17, accent_color: 0xf5c518, components: msg3 }] });

  return payloads;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODULE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
// ── Commands Panel ────────────────────────────────────────────────────────
(function() {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content.trim().toLowerCase() !== "!commands") return;

    // Only staff or admin can use it to avoid spam, but you can remove this check
    const isStaff = message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
      message.member?.roles.cache.some((r) =>
        ["1431277242696208505", "1431277242696208505"].includes(r.id)
      );

    if (!isStaff) {
      // Still show it to everyone — remove the check above if you prefer open access
      // For now, everyone can use !commands
    }

    try {
      await message.delete().catch(() => {});
      const payloads = buildCommandsPayloads();
      for (const payload of payloads) {
        await message.channel.send(payload);
      }
    } catch (err) {
      console.error("[Commands Panel]", err.message);
      await message.channel.send(`❌ Error: ${err.message}`).catch(() => {});
    }
  });

  console.log("[Commands Panel] ✅ Registered");
})();

// ══════════════════════════════════════════════════════════════════════════════
//  READY
// ══════════════════════════════════════════════════════════════════════════════
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📡 Serving ${client.guilds.cache.size} guild(s)`);
});


// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════════════════════
client.login(TOKEN);