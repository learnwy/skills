use clap::{Parser, Subcommand};
use rule_core::RuleListItem;

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
    }

    Ok(())
}
