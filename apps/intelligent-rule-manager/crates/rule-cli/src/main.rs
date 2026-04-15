use clap::{Parser, Subcommand};

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
    }

    Ok(())
}
