use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use deno_bindgen::deno_bindgen;


#[deno_bindgen]
fn argon2_hash_password(password_to_hash: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hashed_password = argon2
        .hash_password(password_to_hash.as_bytes(), &salt)
        .unwrap()
        .to_string();
    hashed_password
}
