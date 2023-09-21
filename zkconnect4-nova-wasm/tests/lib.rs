#[cfg(target_family = "wasm")]

use nova_scotia::circom::circuit::CircomCircuit;
use nova_scotia::{circom::wasm::load_r1cs, create_recursive_circuit, FileLocation, C1, C2, F};
use nova_snark::{provider, traits::circuit::TrivialTestCircuit, PublicParams};
use wasm_bindgen_test::*;
use zkconnect4_nova_lib::{
    create_private_inputs, download_json_string, get_chunked_pp_file, get_initial_game_root, Game,
    BUCKET_URL, FILE_NAME, PP_FOLDER_NAME, PP_PARAMS_PREFIX, G1, G2
};

#[wasm_bindgen_test]
async fn load_r1cs_and_pp() {
    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
    load_r1cs::<G1, G2>(&FileLocation::URL(
        BUCKET_URL.to_string().clone() + FILE_NAME + ".r1cs",
    ))
    .await;
    let url = BUCKET_URL.to_string() + PP_FOLDER_NAME;
    let prefix = PP_PARAMS_PREFIX.to_string();
    let pp_str = get_chunked_pp_file(&url, &prefix, 11).await;
    let pp = serde_json::from_str::<PublicParams<G1, G2, C1<G1>, C2<G2>>>(&pp_str).unwrap();
    assert_eq!(pp.num_constraints().0, 280482);
}

#[wasm_bindgen_test]
async fn load_example_game() {
    // Load example game from S3, which has 7 turns.
    let game_string = download_json_string(
        &(BUCKET_URL.to_string().clone() + FILE_NAME + "_aggregate_example.json"),
    )
    .await;
    let game: Game = serde_json::from_str(&game_string).unwrap();
    assert_eq!(game.board.len(), 7);
}

#[wasm_bindgen_test]
async fn compute_snark() {
    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_worker);
    let witness_generator_wasm =
        FileLocation::URL(BUCKET_URL.to_string().clone() + FILE_NAME + ".wasm");
    let game_string = download_json_string(
        &(BUCKET_URL.to_string().clone() + FILE_NAME + "_aggregate_example.json"),
    )
    .await;
    let game: Game = serde_json::from_str(&game_string).unwrap();
    let n_turns = game.board.len();
    let initial_root = F::<G1>::from_raw(get_initial_game_root(&game));
    let start_public_input = vec![
        initial_root,
        F::<G1>::from(game.initialStepIn.1),
        F::<G1>::from(game.initialStepIn.2),
    ];
    let private_inputs = create_private_inputs(&game, n_turns);

    let r1cs = load_r1cs::<G1, G2>(&FileLocation::URL(
        BUCKET_URL.to_string().clone() + FILE_NAME + ".r1cs",
    ))
    .await;
    let url = BUCKET_URL.to_string() + PP_FOLDER_NAME;

    let pp_str = get_chunked_pp_file(
        &url,
        &PP_PARAMS_PREFIX.to_string(),
        11,
    )
    .await;
    let pp = serde_json::from_str::<
        PublicParams<G1, G2, CircomCircuit<F<G1>>, TrivialTestCircuit<F<G2>>>,
    >(&pp_str)
    .unwrap();
    create_recursive_circuit(
        witness_generator_wasm,
        r1cs,
        private_inputs,
        start_public_input.clone(),
        &pp,
    )
    .await
    .unwrap();
}
