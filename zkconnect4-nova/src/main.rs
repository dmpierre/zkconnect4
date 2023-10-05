use std::{env::current_dir, time::Instant};

use nova_scotia::{
    circom::reader::load_r1cs, create_public_params, create_recursive_circuit, FileLocation, C1,
    C2, F, S,
};

use nova_snark::{provider, CompressedSNARK, PublicParams};
use zkconnect4_nova_lib::{
    create_private_inputs, get_initial_game_root, get_pp_file, println_pp, Game,
};

async fn run(circuit_file_path: String, witness_gen_filepath: String, download_pp: bool) {
    type G1 = provider::bn256_grumpkin::bn256::Point;
    type G2 = provider::bn256_grumpkin::grumpkin::Point;

    let root = current_dir().unwrap();
    let circuit_file = root.join(circuit_file_path);
    let r1cs = load_r1cs::<G1, G2>(&FileLocation::PathBuf(circuit_file));
    let witness_generator_file = root.join(witness_gen_filepath);
    let game: Game = serde_json::from_str(include_str!("../data/game/aggregate.json")).unwrap();

    let n_turns = game.board.len();
    let initial_root = F::<G1>::from_raw(get_initial_game_root(&game));
    let start_public_input = vec![
        initial_root,
        F::<G1>::from(game.initialStepIn.1),
        F::<G1>::from(game.initialStepIn.2),
    ];
    let private_inputs = create_private_inputs(&game, n_turns);

    let pp_str: String;
    let pp: PublicParams<G1, G2, C1<G1>, C2<G2>>;

    if download_pp {
        println!("Downloading pp... You can generate public parameters yourself by providing download_pp=false");
        pp_str = get_pp_file("https://d2ovde7k6pdj39.cloudfront.net/pp_zkconnect4.json").await;
        pp = serde_json::from_str::<PublicParams<G1, G2, C1<G1>, C2<G2>>>(&pp_str).unwrap();
    } else {
        println!("Generating pp...");
        pp = create_public_params::<G1, G2>(r1cs.clone());
    }

    println_pp(&pp);

    println!("Creating a RecursiveSNARK...");
    let start = Instant::now();
    let recursive_snark = create_recursive_circuit(
        FileLocation::PathBuf(witness_generator_file),
        r1cs,
        private_inputs,
        start_public_input.to_vec(),
        &pp,
    )
    .unwrap();
    println!("RecursiveSNARK creation took {:?}", start.elapsed());

    let z0_secondary = [F::<G2>::from(0)];

    // verify the recursive SNARK
    println!("Verifying a RecursiveSNARK...");
    let start = Instant::now();
    let res = recursive_snark.verify(&pp, n_turns, &start_public_input, &z0_secondary);
    println!(
        "RecursiveSNARK::verify: {:?}, took {:?}",
        res,
        start.elapsed()
    );
    assert!(res.is_ok());

    // produce a compressed SNARK
    println!("Generating a CompressedSNARK using Spartan with IPA-PC...");
    let start = Instant::now();
    let (pk, vk) = CompressedSNARK::<_, _, _, _, S<G1>, S<G2>>::setup(&pp).unwrap();
    let res = CompressedSNARK::<_, _, _, _, S<G1>, S<G2>>::prove(&pp, &pk, &recursive_snark);
    println!(
        "CompressedSNARK::prove: {:?}, took {:?}",
        res.is_ok(),
        start.elapsed()
    );
    assert!(res.is_ok());
    let compressed_snark = res.unwrap();

    // verify the compressed SNARK
    println!("Verifying a CompressedSNARK...");
    let start = Instant::now();
    let res = compressed_snark.verify(
        &vk,
        n_turns,
        start_public_input.to_vec(),
        z0_secondary.to_vec(),
    );

    println!(
        "CompressedSNARK::verify: {:?}, took {:?}",
        res.is_ok(),
        start.elapsed()
    );

    assert!(res.is_ok());
}

#[tokio::main]
async fn main() {
    let circuit_filepath = format!("data/main.r1cs");
    let witness_gen_filepath = format!("data/main.wasm");
    run(circuit_filepath, witness_gen_filepath, true).await;
}
