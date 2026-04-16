mod i18n;

use clap::{CommandFactory, FromArgMatches, Parser, Subcommand};
use rule_core::{NewRuleInput, RuleListItem};

#[derive(Debug, Parser)]
#[command(name = "rule-cli")]
struct Cli {
    #[arg(long, global = true)]
    locale: Option<String>,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Healthcheck,
    WorkspaceSummary,
    List,
    Stats,
    RecommendVisualization,
    Inspect {
        #[arg(long)]
        file: String,
    },
    Create {
        #[arg(long)]
        title: String,
        #[arg(long)]
        summary: Option<String>,
        #[arg(long, value_delimiter = ',')]
        groups: Vec<String>,
        #[arg(long, value_delimiter = ',')]
        tags: Vec<String>,
        #[arg(long, value_delimiter = ',')]
        targets: Vec<String>,
    },
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hint_locale = i18n::detect_locale_from_args_or_env();
    let command = i18n::localize_command(Cli::command(), hint_locale);
    let matches = command.get_matches();
    let cli = Cli::from_arg_matches(&matches)?;

    match cli.command.unwrap_or(Commands::WorkspaceSummary) {
        Commands::Healthcheck => {
            println!("{}", serde_json::to_string_pretty(&rule_core::healthcheck())?);
        }
        Commands::WorkspaceSummary => {
            println!(
                "{}",
                serde_json::to_string_pretty(&rule_core::workspace_summary())?
            );
        }
        Commands::List => {
            let rules: Vec<RuleListItem> = rule_core::list_rules()?;
            println!("{}", serde_json::to_string_pretty(&rules)?);
        }
        Commands::Stats => {
            println!("{}", serde_json::to_string_pretty(&rule_core::stats()?)?);
        }
        Commands::RecommendVisualization => {
            println!(
                "{}",
                serde_json::to_string_pretty(&rule_core::recommend_visualization()?)?
            );
        }
        Commands::Inspect { file } => {
            println!("{}", serde_json::to_string_pretty(&rule_core::load_rule(file)?)?);
        }
        Commands::Create {
            title,
            summary,
            groups,
            tags,
            targets,
        } => {
            let created = rule_core::create_rule(NewRuleInput {
                title,
                summary,
                groups,
                tags,
                targets,
            })?;
            println!("{}", serde_json::to_string_pretty(&created)?);
        }
    }

    Ok(())
}
