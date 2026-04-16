use clap::Command;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Locale {
    En,
    ZhCn,
}

pub fn detect_locale_from_args_or_env() -> Locale {
    let args = std::env::args().collect::<Vec<_>>();
    let mut index = 0;
    while index < args.len() {
        if args[index] == "--locale" {
            if let Some(value) = args.get(index + 1) {
                return normalize_locale(value);
            }
        } else if let Some(value) = args[index].strip_prefix("--locale=") {
            return normalize_locale(value);
        }
        index += 1;
    }

    let env_locale = std::env::var("LEARNWY_LOCALE")
        .ok()
        .or_else(|| std::env::var("LC_ALL").ok())
        .or_else(|| std::env::var("LANG").ok());

    normalize_locale(env_locale.as_deref().unwrap_or("en"))
}

pub fn normalize_locale(value: &str) -> Locale {
    if value.to_lowercase().starts_with("zh") {
        Locale::ZhCn
    } else {
        Locale::En
    }
}

pub fn localize_command(command: Command, locale: Locale) -> Command {
    command
        .about(message(locale, "cli.about"))
        .long_about(message(locale, "cli.about"))
        .mut_arg("locale", |argument| {
            argument
                .help(message(locale, "arg.locale.help"))
                .long_help(message(locale, "arg.locale.help"))
        })
        .mut_subcommand("healthcheck", |subcommand| {
            subcommand.about(message(locale, "command.healthcheck.about"))
        })
        .mut_subcommand("workspace-summary", |subcommand| {
            subcommand.about(message(locale, "command.workspace_summary.about"))
        })
        .mut_subcommand("list", |subcommand| {
            subcommand.about(message(locale, "command.list.about"))
        })
        .mut_subcommand("stats", |subcommand| {
            subcommand.about(message(locale, "command.stats.about"))
        })
        .mut_subcommand("recommend-visualization", |subcommand| {
            subcommand.about(message(locale, "command.recommend.about"))
        })
        .mut_subcommand("inspect", |subcommand| {
            subcommand
                .about(message(locale, "command.inspect.about"))
                .mut_arg("file", |argument| argument.help(message(locale, "arg.file.help")))
        })
        .mut_subcommand("create", |subcommand| {
            subcommand
                .about(message(locale, "command.create.about"))
                .mut_arg("title", |argument| {
                    argument.help(message(locale, "arg.title.help"))
                })
                .mut_arg("summary", |argument| {
                    argument.help(message(locale, "arg.summary.help"))
                })
                .mut_arg("groups", |argument| {
                    argument.help(message(locale, "arg.groups.help"))
                })
                .mut_arg("tags", |argument| {
                    argument.help(message(locale, "arg.tags.help"))
                })
                .mut_arg("targets", |argument| {
                    argument.help(message(locale, "arg.targets.help"))
                })
        })
}

fn message(locale: Locale, key: &str) -> &'static str {
    match (locale, key) {
        (Locale::En, "cli.about") => "CLI for the intelligent rule manager workspace",
        (Locale::ZhCn, "cli.about") => "智能规则管理器工作区 CLI",
        (Locale::En, "arg.locale.help") => "Choose the CLI locale, for example en or zh-CN",
        (Locale::ZhCn, "arg.locale.help") => "选择 CLI 语言，例如 en 或 zh-CN",
        (Locale::En, "command.healthcheck.about") => "Print the shared rule-core healthcheck as JSON",
        (Locale::ZhCn, "command.healthcheck.about") => "以 JSON 输出共享 rule-core 健康检查结果",
        (Locale::En, "command.workspace_summary.about") => {
            "Print the current shared rules workspace summary as JSON"
        }
        (Locale::ZhCn, "command.workspace_summary.about") => {
            "以 JSON 输出当前共享规则工作区摘要"
        }
        (Locale::En, "command.list.about") => "List discovered rules as JSON",
        (Locale::ZhCn, "command.list.about") => "以 JSON 列出已发现的规则",
        (Locale::En, "command.stats.about") => "Print rule library statistics as JSON",
        (Locale::ZhCn, "command.stats.about") => "以 JSON 输出规则库统计信息",
        (Locale::En, "command.recommend.about") => {
            "Print the current visualization recommendation as JSON"
        }
        (Locale::ZhCn, "command.recommend.about") => "以 JSON 输出当前可视化建议",
        (Locale::En, "command.inspect.about") => "Inspect one rule document as JSON",
        (Locale::ZhCn, "command.inspect.about") => "以 JSON 查看单条规则文档",
        (Locale::En, "command.create.about") => "Create one rule document and print it as JSON",
        (Locale::ZhCn, "command.create.about") => "创建一条规则文档并以 JSON 输出",
        (Locale::En, "arg.file.help") => "Path to the rule Markdown file",
        (Locale::ZhCn, "arg.file.help") => "规则 Markdown 文件路径",
        (Locale::En, "arg.title.help") => "Rule title",
        (Locale::ZhCn, "arg.title.help") => "规则标题",
        (Locale::En, "arg.summary.help") => "Optional one-line summary",
        (Locale::ZhCn, "arg.summary.help") => "可选的一行摘要",
        (Locale::En, "arg.groups.help") => "Comma-separated groups",
        (Locale::ZhCn, "arg.groups.help") => "逗号分隔的分组列表",
        (Locale::En, "arg.tags.help") => "Comma-separated tags",
        (Locale::ZhCn, "arg.tags.help") => "逗号分隔的标签列表",
        (Locale::En, "arg.targets.help") => "Comma-separated targets",
        (Locale::ZhCn, "arg.targets.help") => "逗号分隔的目标列表",
        _ => "",
    }
}
