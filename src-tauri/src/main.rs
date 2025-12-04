// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 在 Windows 上禁用 GPU 硬件加速以解决白屏问题
    // 这对于一些显卡驱动不兼容的电脑很有帮助
    #[cfg(target_os = "windows")]
    {
        std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--disable-gpu");
    }

    tauri_app_lib::run()
}
