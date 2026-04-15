use clap::{Parser, Subcommand};
use rule_core::{NewRuleInput, RuleListItem};

#[derive(Debug, Parser)]
#[command(name = "rule-cli")]
#[command(about = "CLI for the intelligent rule manager workspace")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Healthcheck,
    WorkspaceSummary,
    List,
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
    let cli = Cli::parse();

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
