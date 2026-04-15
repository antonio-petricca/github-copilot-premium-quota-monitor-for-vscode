/**
 * Localization support (mirrors Messages.kt from the IntelliJ plugin).
 *
 * Supported locales: de, es, fr, it, ja, pt, ru, sq, tr, zh.
 * Falls back to English for any unknown locale or missing key.
 *
 * Usage:
 *   import { t, tf } from './i18n';
 *   t('statusbar_widget_signin')          // → localized string
 *   tf('general_api_http', 404)           // → "GitHub API returned HTTP 404."
 */

import * as vscode from 'vscode';

type Bundle = Record<string, string>;

// ── Helper that builds a tooltip Markdown string ──────────────────────────────

function tooltip(title: string, body: string): string {
    return `**${title}**\n\n${body}`;
}

function tooltipTable(title: string, remaining: string, interactions: string, renewal: string): string {
    return `**${title}**\n\n| | |\n|:--|:--|\n| ${remaining} | {0}% |\n| ${interactions} | {1} |\n| ${renewal} | {2} |`;
}

function tooltipTableWithTotal(title: string, remaining: string, interactions: string, of: string, renewal: string): string {
    return `**${title}**\n\n| | |\n|:--|:--|\n| ${remaining} | {0}% |\n| ${interactions} | {1} ${of} {2} |\n| ${renewal} | {3} |`;
}

// ── English (fallback) ────────────────────────────────────────────────────────

const EN: Bundle = {
    general_api_http: 'GitHub API returned HTTP {0}.',
    general_network_error: 'Network error',
    general_not_signed_in: "Not signed in. Click the status bar widget and choose 'Sign in with GitHub'.",
    general_parse_failed: 'Failed to parse quota data: {0}',
    general_token_invalid: 'GitHub token is invalid or expired (HTTP {0}). Click the status bar widget to sign in again.',

    deviceauth_button_cancel: 'Cancel',
    deviceauth_button_ok: 'Confirm',
    deviceauth_code_expired: 'Code expired — please restart the sign-in process.',
    deviceauth_copy: 'Copy Code',
    deviceauth_copy_done: '✓ Copied!',
    deviceauth_dialog_header: 'GitHub Copilot Authentication',
    deviceauth_dialog_subtitle: 'Complete the steps below to authorize the extension.',
    deviceauth_dialog_title: 'Sign In to GitHub Copilot',
    deviceauth_error_with_message: 'Error: {0}',
    deviceauth_network_error_prefix: 'Network error: {0}',
    deviceauth_open_url: 'Open in Browser',
    deviceauth_step1: 'Open the GitHub authorization page in your browser',
    deviceauth_step2: 'Copy and enter this one-time code on GitHub',
    deviceauth_waiting_auth: 'Waiting for authorization…',

    statusbar_action_refresh: 'Refresh',
    statusbar_action_settings: 'Open Settings…',
    statusbar_action_manage_copilot: 'Open GitHub Copilot Dashboard',
    statusbar_action_signin: 'Sign in with GitHub',
    statusbar_action_signout: 'Sign Out',
    statusbar_signout_complete: 'Signed out.',
    statusbar_signout_confirm_no_username: 'Sign out?',
    statusbar_signout_confirm_when_username: 'Sign out "{0}"?',
    statusbar_signout_title: 'GitHub Sign Out',
    statusbar_tooltip_error: tooltip('GitHub Copilot premium quota monitor', '✗ Error: {0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot premium quota monitor', 'Loading...'),
    statusbar_tooltip_noaccount: '⚠ Not signed in.\n\n*Click to sign in.*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot premium quota monitor', 'Unlimited premium quota'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot premium quota monitor', 'Remaining quota:', 'Interactions:', 'Renewal:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot premium quota monitor', 'Remaining quota:', 'Interactions:', 'of', 'Renewal:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Sign in',
    statusbar_widget_unlimited: '∞',

    statusbar_dialog_auth_error_msg: 'Authentication error: {0}',
    statusbar_dialog_auth_error_title: 'Authentication Error',

    auth_device_code_http_error: 'GitHub returned HTTP {0} for device-code request',
    auth_missing_device_code: 'Missing device_code in response',
    auth_missing_user_code: 'Missing user_code in response',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Unknown error',
};

// ── German ────────────────────────────────────────────────────────────────────

const DE: Bundle = {
    general_api_http: 'Die GitHub-API gab HTTP {0} zurück.',
    general_network_error: 'Netzwerkfehler',
    general_not_signed_in: 'Nicht angemeldet. Klicken Sie auf das Statusleisten-Widget und wählen Sie "Mit GitHub anmelden".',
    general_parse_failed: 'Fehler beim Parsen der Kontingentdaten: {0}',
    general_token_invalid: 'Das GitHub-Token ist ungültig oder abgelaufen (HTTP {0}). Klicken Sie auf das Widget und wählen Sie "Mit GitHub anmelden".',

    deviceauth_button_cancel: 'Abbrechen',
    deviceauth_button_ok: 'Bestätigen',
    deviceauth_code_expired: 'Code abgelaufen — bitte starten Sie den Anmeldevorgang neu.',
    deviceauth_copy: 'Code kopieren',
    deviceauth_copy_done: '✓ Kopiert!',
    deviceauth_dialog_header: 'GitHub Copilot-Authentifizierung',
    deviceauth_dialog_subtitle: 'Führen Sie die folgenden Schritte aus, um die Erweiterung zu autorisieren.',
    deviceauth_dialog_title: 'Bei GitHub Copilot anmelden',
    deviceauth_error_with_message: 'Fehler: {0}',
    deviceauth_network_error_prefix: 'Netzwerkfehler: {0}',
    deviceauth_open_url: 'Im Browser öffnen',
    deviceauth_step1: 'Öffnen Sie die GitHub-Autorisierungsseite in Ihrem Browser',
    deviceauth_step2: 'Kopieren Sie diesen Einmal-Code und geben Sie ihn auf GitHub ein',
    deviceauth_waiting_auth: 'Warten auf Autorisierung…',

    statusbar_action_refresh: 'Aktualisieren',
    statusbar_action_settings: 'Einstellungen…',
    statusbar_action_manage_copilot: 'GitHub Copilot-Dashboard öffnen',
    statusbar_action_signin: 'Mit GitHub anmelden',
    statusbar_action_signout: 'Abmelden',
    statusbar_signout_complete: 'Abgemeldet.',
    statusbar_signout_confirm_no_username: 'Abmelden?',
    statusbar_signout_confirm_when_username: 'Von "{0}" abmelden?',
    statusbar_signout_title: 'GitHub-Abmeldung',
    statusbar_tooltip_error: tooltip('GitHub Copilot Premium-Kontingentüberwachung', '✗ Fehler: {0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot Premium-Kontingentüberwachung', 'Laden...'),
    statusbar_tooltip_noaccount: '⚠ Nicht angemeldet.\n\n*Klicken Sie, um sich anzumelden.*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot Premium-Kontingentüberwachung', 'Unbegrenztes Premium-Kontingent'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot Premium-Kontingentüberwachung', 'Verbleibendes Kontingent:', 'Interaktionen:', 'Erneuerung:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot Premium-Kontingentüberwachung', 'Verbleibendes Kontingent:', 'Interaktionen:', 'von', 'Erneuerung:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Anmelden',
    statusbar_widget_unlimited: '∞',

    statusbar_dialog_auth_error_msg: 'Authentifizierungsfehler: {0}',
    statusbar_dialog_auth_error_title: 'Authentifizierungsfehler',

    auth_device_code_http_error: 'GitHub hat HTTP {0} für die device-code-Anfrage zurückgegeben',
    auth_missing_device_code: 'device_code fehlt in der Antwort',
    auth_missing_user_code: 'user_code fehlt in der Antwort',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Unbekannter Fehler',
};

// ── Spanish ───────────────────────────────────────────────────────────────────

const ES: Bundle = {
    general_api_http: 'La API de GitHub devolvió HTTP {0}.',
    general_network_error: 'Error de red',
    general_not_signed_in: 'No has iniciado sesión. Haz clic en el widget y elige "Iniciar sesión con GitHub".',
    general_parse_failed: 'No se pudieron analizar los datos de cuota: {0}',
    general_token_invalid: 'El token de GitHub no es válido o ha caducado (HTTP {0}). Haz clic en el widget para iniciar sesión de nuevo.',

    deviceauth_button_cancel: 'Cancelar',
    deviceauth_button_ok: 'Confirmar',
    deviceauth_code_expired: 'Código expirado — por favor reinicia el proceso de inicio de sesión.',
    deviceauth_copy: 'Copiar código',
    deviceauth_copy_done: '✓ ¡Copiado!',
    deviceauth_dialog_header: 'Autenticación GitHub Copilot',
    deviceauth_dialog_subtitle: 'Completa los pasos siguientes para autorizar la extensión.',
    deviceauth_dialog_title: 'Iniciar sesión en GitHub Copilot',
    deviceauth_error_with_message: 'Error: {0}',
    deviceauth_network_error_prefix: 'Error de red: {0}',
    deviceauth_open_url: 'Abrir en el navegador',
    deviceauth_step1: 'Abre la página de autorización de GitHub en tu navegador',
    deviceauth_step2: 'Copia y pega este código de un solo uso en GitHub',
    deviceauth_waiting_auth: 'Esperando autorización…',

    statusbar_action_refresh: 'Actualizar',
    statusbar_action_settings: 'Configuración…',
    statusbar_action_manage_copilot: 'Abrir panel de GitHub Copilot',
    statusbar_action_signin: 'Iniciar sesión con GitHub',
    statusbar_action_signout: 'Cerrar sesión',
    statusbar_signout_complete: 'Sesión cerrada.',
    statusbar_signout_confirm_no_username: '¿Cerrar sesión?',
    statusbar_signout_confirm_when_username: '¿Cerrar sesión de "{0}"?',
    statusbar_signout_title: 'Cerrar sesión de GitHub',
    statusbar_tooltip_error: tooltip('Monitor de cuota premium GitHub Copilot', '✗ Error: {0}'),
    statusbar_tooltip_loading: tooltip('Monitor de cuota premium GitHub Copilot', 'Cargando...'),
    statusbar_tooltip_noaccount: '⚠ No has iniciado sesión.\n\n*Haz clic para iniciar sesión.*',
    statusbar_tooltip_unlimited: tooltip('Monitor de cuota premium GitHub Copilot', 'Cuota premium ilimitada'),
    statusbar_tooltip_available: tooltipTable('Monitor de cuota premium GitHub Copilot', 'Cuota restante:', 'Interacciones:', 'Renovación:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('Monitor de cuota premium GitHub Copilot', 'Cuota restante:', 'Interacciones:', 'de', 'Renovación:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Iniciar sesión',
    statusbar_widget_unlimited: '∞',

    statusbar_dialog_auth_error_msg: 'Error de autenticación: {0}',
    statusbar_dialog_auth_error_title: 'Error de autenticación',

    auth_device_code_http_error: 'GitHub devolvió HTTP {0} para la solicitud de device-code',
    auth_missing_device_code: 'Falta device_code en la respuesta',
    auth_missing_user_code: 'Falta user_code en la respuesta',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Error desconocido',
};

// ── French ────────────────────────────────────────────────────────────────────

const FR: Bundle = {
    general_api_http: "L'API GitHub a renvoyé HTTP {0}.",
    general_network_error: 'Erreur réseau',
    general_not_signed_in: "Non connecté. Cliquez sur le widget et choisissez « Se connecter avec GitHub ».",
    general_parse_failed: "Échec de l'analyse des données de quota : {0}",
    general_token_invalid: "Le jeton GitHub est invalide ou a expiré (HTTP {0}). Cliquez sur le widget pour vous reconnecter.",

    deviceauth_button_cancel: 'Annuler',
    deviceauth_button_ok: 'Confirmer',
    deviceauth_code_expired: 'Code expiré — veuillez relancer le processus de connexion.',
    deviceauth_copy: 'Copier le code',
    deviceauth_copy_done: '✓ Copié !',
    deviceauth_dialog_header: 'Authentification GitHub Copilot',
    deviceauth_dialog_subtitle: "Complétez les étapes ci-dessous pour autoriser l'extension.",
    deviceauth_dialog_title: 'Se connecter à GitHub Copilot',
    deviceauth_error_with_message: 'Erreur : {0}',
    deviceauth_network_error_prefix: 'Erreur réseau : {0}',
    deviceauth_open_url: 'Ouvrir dans le navigateur',
    deviceauth_step1: "Ouvrez la page d'autorisation GitHub dans votre navigateur",
    deviceauth_step2: 'Copiez et saisissez ce code à usage unique sur GitHub',
    deviceauth_waiting_auth: "En attente d'autorisation…",

    statusbar_action_refresh: 'Actualiser',
    statusbar_action_settings: 'Paramètres…',
    statusbar_action_manage_copilot: 'Ouvrir le tableau de bord GitHub Copilot',
    statusbar_action_signin: 'Se connecter avec GitHub',
    statusbar_action_signout: 'Se déconnecter',
    statusbar_signout_complete: 'Déconnecté.',
    statusbar_signout_confirm_no_username: 'Se déconnecter ?',
    statusbar_signout_confirm_when_username: 'Se déconnecter de « {0} » ?',
    statusbar_signout_title: 'Déconnexion GitHub',
    statusbar_tooltip_error: tooltip('Moniteur de quota premium GitHub Copilot', 'Erreur : {0}'),
    statusbar_tooltip_loading: tooltip('Moniteur de quota premium GitHub Copilot', 'Chargement...'),
    statusbar_tooltip_noaccount: '⚠ Non connecté.\n\n*Cliquez pour vous connecter.*',
    statusbar_tooltip_unlimited: tooltip('Moniteur de quota premium GitHub Copilot', 'Quota premium illimité'),
    statusbar_tooltip_available: tooltipTable('Moniteur de quota premium GitHub Copilot', 'Quota restant :', 'Interactions :', 'Renouvellement :'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('Moniteur de quota premium GitHub Copilot', 'Quota restant :', 'Interactions :', 'sur', 'Renouvellement :'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Se connecter',
    statusbar_widget_unlimited: '∞',

    statusbar_dialog_auth_error_msg: "Erreur d'authentification : {0}",
    statusbar_dialog_auth_error_title: "Erreur d'authentification",

    auth_device_code_http_error: 'GitHub a renvoyé HTTP {0} pour la demande de device-code',
    auth_missing_device_code: 'Code device_code manquant dans la réponse',
    auth_missing_user_code: 'Code user_code manquant dans la réponse',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Erreur inconnue',
};

// ── Italian ───────────────────────────────────────────────────────────────────

const IT: Bundle = {
    general_api_http: 'GitHub API ha restituito HTTP {0}.',
    general_network_error: 'Errore di rete',
    general_not_signed_in: "Non sei connesso. Fai clic sul widget e scegli 'Accedi con GitHub'.",
    general_parse_failed: 'Impossibile analizzare i dati della quota: {0}',
    general_token_invalid: "Il token GitHub non è valido o è scaduto (HTTP {0}). Fai clic sul widget per accedere nuovamente.",

    deviceauth_button_cancel: 'Annulla',
    deviceauth_button_ok: 'Conferma',
    deviceauth_code_expired: 'Codice scaduto — riavvia il processo di accesso.',
    deviceauth_copy: 'Copia codice',
    deviceauth_copy_done: '✓ Copiato!',
    deviceauth_dialog_header: 'Autenticazione GitHub Copilot',
    deviceauth_dialog_subtitle: "Completa i passaggi qui sotto per autorizzare l'estensione.",
    deviceauth_dialog_title: 'Accedi a GitHub Copilot',
    deviceauth_error_with_message: 'Errore: {0}',
    deviceauth_network_error_prefix: 'Errore di rete: {0}',
    deviceauth_open_url: 'Apri nel browser',
    deviceauth_step1: 'Apri la pagina di autorizzazione di GitHub nel tuo browser',
    deviceauth_step2: 'Copia e inserisci questo codice monouso su GitHub',
    deviceauth_waiting_auth: 'In attesa di autorizzazione…',

    statusbar_action_refresh: 'Aggiorna',
    statusbar_action_settings: 'Impostazioni…',
    statusbar_action_manage_copilot: 'Apri la dashboard di GitHub Copilot',
    statusbar_action_signin: 'Accedi con GitHub',
    statusbar_action_signout: 'Disconnetti',
    statusbar_signout_complete: 'Disconnesso.',
    statusbar_signout_confirm_no_username: 'Disconnettersi?',
    statusbar_signout_confirm_when_username: 'Disconnetti "{0}"?',
    statusbar_signout_title: 'Disconnessione GitHub',
    statusbar_tooltip_error: tooltip('Monitor quota premium GitHub Copilot', '✗ Errore: {0}'),
    statusbar_tooltip_loading: tooltip('Monitor quota premium GitHub Copilot', 'Caricamento...'),
    statusbar_tooltip_noaccount: '⚠ Non sei connesso.\n\n*Fai clic per accedere.*',
    statusbar_tooltip_unlimited: tooltip('Monitor quota premium GitHub Copilot', 'Quota premium illimitata'),
    statusbar_tooltip_available: tooltipTable('Monitor quota premium GitHub Copilot', 'Quota residua:', 'Interazioni:', 'Rinnovo:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('Monitor quota premium GitHub Copilot', 'Quota residua:', 'Interazioni:', 'di', 'Rinnovo:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Accedi',
    statusbar_widget_unlimited: '∞',

    statusbar_dialog_auth_error_msg: 'Errore di autenticazione: {0}',
    statusbar_dialog_auth_error_title: 'Errore di autenticazione',

    auth_device_code_http_error: 'GitHub ha restituito HTTP {0} per la richiesta del device-code',
    auth_missing_device_code: 'Manca device_code nella risposta',
    auth_missing_user_code: 'Manca user_code nella risposta',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Errore sconosciuto',
};

// ── Japanese ──────────────────────────────────────────────────────────────────

const JA: Bundle = {
    general_api_http: 'GitHub API は HTTP {0} を返しました。',
    general_network_error: 'ネットワーク エラー',
    general_not_signed_in: 'サインインしていません。ウィジェットをクリックして「GitHub でサインイン」を選択してください。',
    general_parse_failed: 'クォータ データの解析に失敗しました: {0}',
    general_token_invalid: 'GitHub トークンが無効または期限切れです (HTTP {0})。ウィジェットをクリックして再度サインインしてください。',

    deviceauth_button_cancel: 'キャンセル',
    deviceauth_button_ok: '確認',
    deviceauth_code_expired: 'コードの有効期限が切れました — サインイン プロセスを再開してください。',
    deviceauth_copy: 'コードをコピー',
    deviceauth_copy_done: '✓ コピーしました！',
    deviceauth_dialog_header: 'GitHub Copilot 認証',
    deviceauth_dialog_subtitle: '拡張機能を認可するために以下の手順を完了してください。',
    deviceauth_dialog_title: 'GitHub Copilot にサインイン',
    deviceauth_error_with_message: 'エラー: {0}',
    deviceauth_network_error_prefix: 'ネットワーク エラー: {0}',
    deviceauth_open_url: 'ブラウザで開く',
    deviceauth_step1: 'ブラウザで GitHub の認可ページを開きます',
    deviceauth_step2: 'このワンタイムコードを GitHub にコピーして入力します',
    deviceauth_waiting_auth: '認可を待っています…',

    statusbar_action_refresh: '更新',
    statusbar_action_settings: '設定…',
    statusbar_action_manage_copilot: 'GitHub Copilot ダッシュボードを開く',
    statusbar_action_signin: 'GitHub でサインイン',
    statusbar_action_signout: 'サインアウト',
    statusbar_signout_complete: 'サインアウトしました。',
    statusbar_signout_confirm_no_username: 'サインアウトしますか？',
    statusbar_signout_confirm_when_username: '"{0}" をサインアウトしますか？',
    statusbar_signout_title: 'GitHub サインアウト',
    statusbar_tooltip_error: tooltip('GitHub Copilot プレミアム クォータ モニター', 'エラー: {0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot プレミアム クォータ モニター', '読み込み中...'),
    statusbar_tooltip_noaccount: '⚠ サインインしていません。\n\n*サインインするにはクリックしてください。*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot プレミアム クォータ モニター', '無制限のプレミアム クォータ'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot プレミアム クォータ モニター', '残りのクォータ:', 'やり取り:', '更新:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot プレミアム クォータ モニター', '残りのクォータ:', 'やり取り:', '/', '更新:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — サインイン',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: '認証エラー: {0}',
    statusbar_dialog_auth_error_title: '認証エラー',

    auth_device_code_http_error: 'GitHub は device-code リクエストに対して HTTP {0} を返しました',
    auth_missing_device_code: 'レスポンスに device_code がありません',
    auth_missing_user_code: 'レスポンスに user_code がありません',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: '不明なエラー',
};

// ── Portuguese ────────────────────────────────────────────────────────────────

const PT: Bundle = {
    general_api_http: 'A API do GitHub retornou HTTP {0}.',
    general_network_error: 'Erro de rede',
    general_not_signed_in: "Não conectado. Clique no widget e escolha 'Entrar com o GitHub'.",
    general_parse_failed: 'Falha ao analisar os dados de cota: {0}',
    general_token_invalid: 'O token do GitHub é inválido ou expirou (HTTP {0}). Clique no widget para entrar novamente.',

    deviceauth_button_cancel: 'Cancelar',
    deviceauth_button_ok: 'Confirmar',
    deviceauth_code_expired: 'Código expirado — reinicie o processo de login.',
    deviceauth_copy: 'Copiar código',
    deviceauth_copy_done: '✓ Copiado!',
    deviceauth_dialog_header: 'Autenticação GitHub Copilot',
    deviceauth_dialog_subtitle: 'Complete os passos abaixo para autorizar a extensão.',
    deviceauth_dialog_title: 'Entrar no GitHub Copilot',
    deviceauth_error_with_message: 'Erro: {0}',
    deviceauth_network_error_prefix: 'Erro de rede: {0}',
    deviceauth_open_url: 'Abrir no navegador',
    deviceauth_step1: 'Abra a página de autorização do GitHub no seu navegador',
    deviceauth_step2: 'Copie e insira este código de uso único no GitHub',
    deviceauth_waiting_auth: 'Aguardando autorização…',

    statusbar_action_refresh: 'Atualizar',
    statusbar_action_settings: 'Configurações…',
    statusbar_action_manage_copilot: 'Abrir painel do GitHub Copilot',
    statusbar_action_signin: 'Entrar com o GitHub',
    statusbar_action_signout: 'Sair',
    statusbar_signout_complete: 'Desconectado.',
    statusbar_signout_confirm_no_username: 'Sair?',
    statusbar_signout_confirm_when_username: 'Sair de "{0}"?',
    statusbar_signout_title: 'Sair do GitHub',
    statusbar_tooltip_error: tooltip('Monitor de cota premium GitHub Copilot', 'Erro: {0}'),
    statusbar_tooltip_loading: tooltip('Monitor de cota premium GitHub Copilot', 'Carregando...'),
    statusbar_tooltip_noaccount: '⚠ Não conectado.\n\n*Clique para entrar.*',
    statusbar_tooltip_unlimited: tooltip('Monitor de cota premium GitHub Copilot', 'Cota premium ilimitada'),
    statusbar_tooltip_available: tooltipTable('Monitor de cota premium GitHub Copilot', 'Cota restante:', 'Interações:', 'Renovação:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('Monitor de cota premium GitHub Copilot', 'Cota restante:', 'Interações:', 'de', 'Renovação:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Entrar',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: 'Erro de autenticação: {0}',
    statusbar_dialog_auth_error_title: 'Erro de autenticação',

    auth_device_code_http_error: 'O GitHub retornou HTTP {0} para a solicitação de device-code',
    auth_missing_device_code: 'Faltando device_code na resposta',
    auth_missing_user_code: 'Faltando user_code na resposta',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Erro desconhecido',
};

// ── Russian ───────────────────────────────────────────────────────────────────

const RU: Bundle = {
    general_api_http: 'GitHub API вернул HTTP {0}.',
    general_network_error: 'Ошибка сети',
    general_not_signed_in: 'Вы не вошли в систему. Щёлкните на виджете и выберите «Войти через GitHub».',
    general_parse_failed: 'Не удалось разобрать данные квоты: {0}',
    general_token_invalid: 'Токен GitHub недействителен или просрочен (HTTP {0}). Щёлкните на виджете и войдите снова.',

    deviceauth_button_cancel: 'Отмена',
    deviceauth_button_ok: 'Подтвердить',
    deviceauth_code_expired: 'Код истёк — пожалуйста, перезапустите процесс входа.',
    deviceauth_copy: 'Копировать код',
    deviceauth_copy_done: '✓ Скопировано!',
    deviceauth_dialog_header: 'Аутентификация GitHub Copilot',
    deviceauth_dialog_subtitle: 'Выполните шаги ниже, чтобы авторизовать расширение.',
    deviceauth_dialog_title: 'Войти в GitHub Copilot',
    deviceauth_error_with_message: 'Ошибка: {0}',
    deviceauth_network_error_prefix: 'Ошибка сети: {0}',
    deviceauth_open_url: 'Открыть в браузере',
    deviceauth_step1: 'Откройте страницу авторизации GitHub в вашем браузере',
    deviceauth_step2: 'Скопируйте и введите этот одноразовый код на GitHub',
    deviceauth_waiting_auth: 'Ожидание авторизации…',

    statusbar_action_refresh: 'Обновить',
    statusbar_action_settings: 'Настройки…',
    statusbar_action_manage_copilot: 'Открыть панель GitHub Copilot',
    statusbar_action_signin: 'Войти через GitHub',
    statusbar_action_signout: 'Выйти',
    statusbar_signout_complete: 'Выход выполнен.',
    statusbar_signout_confirm_no_username: 'Выйти?',
    statusbar_signout_confirm_when_username: 'Выйти из "{0}"?',
    statusbar_signout_title: 'Выход из GitHub',
    statusbar_tooltip_error: tooltip('Монитор премиум-квоты GitHub Copilot', 'Ошибка: {0}'),
    statusbar_tooltip_loading: tooltip('Монитор премиум-квоты GitHub Copilot', 'Загрузка...'),
    statusbar_tooltip_noaccount: '⚠ Не вошли в систему.\n\n*Нажмите, чтобы войти.*',
    statusbar_tooltip_unlimited: tooltip('Монитор премиум-квоты GitHub Copilot', 'Неограниченная премиум-квота'),
    statusbar_tooltip_available: tooltipTable('Монитор премиум-квоты GitHub Copilot', 'Остаток квоты:', 'Взаимодействия:', 'Обновление:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('Монитор премиум-квоты GitHub Copilot', 'Остаток квоты:', 'Взаимодействия:', 'из', 'Обновление:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Войти',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: 'Ошибка аутентификации: {0}',
    statusbar_dialog_auth_error_title: 'Ошибка аутентификации',

    auth_device_code_http_error: 'GitHub вернул HTTP {0} для запроса device-code',
    auth_missing_device_code: 'Отсутствует device_code в ответе',
    auth_missing_user_code: 'Отсутствует user_code в ответе',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Неизвестная ошибка',
};

// ── Albanian ──────────────────────────────────────────────────────────────────

const SQ: Bundle = {
    general_api_http: 'GitHub API ktheu HTTP {0}.',
    general_network_error: 'Gabim rrjeti',
    general_not_signed_in: "Nuk jeni identifikuar. Klikoni mbi widget dhe zgjidhni 'Identifikohu me GitHub'.",
    general_parse_failed: "Deshtoi të analizohet të dhënat e kuotës: {0}",
    general_token_invalid: "Tokeni i GitHub është i pavlefshëm ose ka skaduar (HTTP {0}). Klikoni mbi widget për t'u identifikuar përsëri.",

    deviceauth_button_cancel: 'Anulo',
    deviceauth_button_ok: 'Konfirmo',
    deviceauth_code_expired: 'Kodi ka skaduar — ju lutemi rinisni procesin e identifikimit.',
    deviceauth_copy: 'Kopjo Kodin',
    deviceauth_copy_done: '✓ U kopjua!',
    deviceauth_dialog_header: 'Autentikimi i GitHub Copilot',
    deviceauth_dialog_subtitle: 'Plotësoni hapat më poshtë për të autorizuar shtojcën.',
    deviceauth_dialog_title: 'Identifikohu në GitHub Copilot',
    deviceauth_error_with_message: 'Gabim: {0}',
    deviceauth_network_error_prefix: 'Gabim rrjeti: {0}',
    deviceauth_open_url: 'Hap në Shfletues',
    deviceauth_step1: 'Hap faqen e autorizimit të GitHub në shfletuesin tuaj',
    deviceauth_step2: 'Kopjoni dhe vendosni këtë kod një-përdorimësh në GitHub',
    deviceauth_waiting_auth: 'Duke pritur autorizimin…',

    statusbar_action_refresh: 'Rifresko',
    statusbar_action_settings: 'Cilësimet…',
    statusbar_action_manage_copilot: 'Hap panelin e GitHub Copilot',
    statusbar_action_signin: 'Identifikohu me GitHub',
    statusbar_action_signout: 'Çkyçu',
    statusbar_signout_complete: 'U çkyç.',
    statusbar_signout_confirm_no_username: 'Të çkyçem?',
    statusbar_signout_confirm_when_username: 'Të çkyçem nga "{0}"?',
    statusbar_signout_title: 'Çkyç nga GitHub',
    statusbar_tooltip_error: tooltip('GitHub Copilot monitorimi i kuotës premium', '✗ Gabim: {0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot monitorimi i kuotës premium', 'Duke u ngarkuar...'),
    statusbar_tooltip_noaccount: '⚠ Nuk jeni identifikuar.\n\n*Klikoni për t\'u identifikuar.*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot monitorimi i kuotës premium', 'Kuotë premium e pakufizuar'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot monitorimi i kuotës premium', 'Kuota e mbetur:', 'Ndërveprimet:', 'Rinovimi:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot monitorimi i kuotës premium', 'Kuota e mbetur:', 'Ndërveprimet:', 'nga', 'Rinovimi:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Identifikohu',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: 'Gabim autentikimi: {0}',
    statusbar_dialog_auth_error_title: 'Gabim Autentikimi',

    auth_device_code_http_error: 'GitHub ktheu HTTP {0} për kërkesën device-code',
    auth_missing_device_code: 'Mungon device_code në përgjigje',
    auth_missing_user_code: 'Mungon user_code në përgjigje',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Gabim i panjohur',
};

// ── Turkish ───────────────────────────────────────────────────────────────────

const TR: Bundle = {
    general_api_http: 'GitHub API HTTP {0} döndürdü.',
    general_network_error: 'Ağ hatası',
    general_not_signed_in: "Oturum açılmadı. Widget'a tıklayın ve 'GitHub ile oturum aç'ı seçin.",
    general_parse_failed: 'Kota verisi ayrıştırılamadı: {0}',
    general_token_invalid: "GitHub jetonu geçersiz veya süresi dolmuş (HTTP {0}). Widget'a tıklayarak oturum açın.",

    deviceauth_button_cancel: 'İptal',
    deviceauth_button_ok: 'Onayla',
    deviceauth_code_expired: 'Kodun süresi doldu — lütfen oturum açma işlemini yeniden başlatın.',
    deviceauth_copy: 'Kodu Kopyala',
    deviceauth_copy_done: '✓ Kopyalandı!',
    deviceauth_dialog_header: 'GitHub Copilot Kimlik Doğrulama',
    deviceauth_dialog_subtitle: 'Eklentiyi yetkilendirmek için aşağıdaki adımları tamamlayın.',
    deviceauth_dialog_title: 'GitHub Copilot ile Oturum Aç',
    deviceauth_error_with_message: 'Hata: {0}',
    deviceauth_network_error_prefix: 'Ağ hatası: {0}',
    deviceauth_open_url: 'Tarayıcıda Aç',
    deviceauth_step1: 'GitHub yetkilendirme sayfasını tarayıcınızda açın',
    deviceauth_step2: "Bu tek seferlik kodu kopyalayıp GitHub'a girin",
    deviceauth_waiting_auth: 'Yetkilendirme bekleniyor…',

    statusbar_action_refresh: 'Yenile',
    statusbar_action_settings: 'Ayarlar…',
    statusbar_action_manage_copilot: 'GitHub Copilot Panosunu Aç',
    statusbar_action_signin: 'GitHub ile oturum aç',
    statusbar_action_signout: 'Çıkış Yap',
    statusbar_signout_complete: 'Çıkış yapıldı.',
    statusbar_signout_confirm_no_username: 'Çıkış yapılsın mı?',
    statusbar_signout_confirm_when_username: '"{0}" kullanıcısından çıkış yapılsın mı?',
    statusbar_signout_title: 'GitHub Çıkış',
    statusbar_tooltip_error: tooltip('GitHub Copilot premium kota izleyici', '✗ Hata: {0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot premium kota izleyici', 'Yükleniyor...'),
    statusbar_tooltip_noaccount: '⚠ Oturum açılmadı.\n\n*Oturum açmak için tıklayın.*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot premium kota izleyici', 'Sınırsız premium kota'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot premium kota izleyici', 'Kalan kota:', 'Etkileşimler:', 'Yenileme:'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot premium kota izleyici', 'Kalan kota:', 'Etkileşimler:', '/', 'Yenileme:'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Oturum aç',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: 'Kimlik doğrulama hatası: {0}',
    statusbar_dialog_auth_error_title: 'Kimlik Doğrulama Hatası',

    auth_device_code_http_error: 'GitHub, cihaz kodu isteği için HTTP {0} döndürdü',
    auth_missing_device_code: 'Yanıtta device_code eksik',
    auth_missing_user_code: 'Yanıtta user_code eksik',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Bilinmeyen hata',
};

// ── Chinese (Simplified) ──────────────────────────────────────────────────────

const ZH: Bundle = {
    general_api_http: 'GitHub API 返回了 HTTP {0}。',
    general_network_error: '网络错误',
    general_not_signed_in: '尚未登录。点击状态栏控件并选择"使用 GitHub 登录"。',
    general_parse_failed: '解析配额数据失败：{0}',
    general_token_invalid: 'GitHub 令牌无效或已过期 (HTTP {0})。点击控件重新登录。',

    deviceauth_button_cancel: '取消',
    deviceauth_button_ok: '确认',
    deviceauth_code_expired: '代码已过期 — 请重新开始登录流程。',
    deviceauth_copy: '复制代码',
    deviceauth_copy_done: '✓ 已复制！',
    deviceauth_dialog_header: 'GitHub Copilot 验证',
    deviceauth_dialog_subtitle: '完成以下步骤以授权扩展。',
    deviceauth_dialog_title: '登录到 GitHub Copilot',
    deviceauth_error_with_message: '错误：{0}',
    deviceauth_network_error_prefix: '网络错误：{0}',
    deviceauth_open_url: '在浏览器中打开',
    deviceauth_step1: '在浏览器中打开 GitHub 授权页面',
    deviceauth_step2: '复制并在 GitHub 上输入此一次性代码',
    deviceauth_waiting_auth: '等待授权…',

    statusbar_action_refresh: '刷新',
    statusbar_action_settings: '设置…',
    statusbar_action_manage_copilot: '打开 GitHub Copilot 仓库',
    statusbar_action_signin: '使用 GitHub 登录',
    statusbar_action_signout: '登出',
    statusbar_signout_complete: '已登出。',
    statusbar_signout_confirm_no_username: '登出？',
    statusbar_signout_confirm_when_username: '登出 "{0}"？',
    statusbar_signout_title: 'GitHub 登出',
    statusbar_tooltip_error: tooltip('GitHub Copilot 高级配额监控', '✗ 错误：{0}'),
    statusbar_tooltip_loading: tooltip('GitHub Copilot 高级配额监控', '加载中...'),
    statusbar_tooltip_noaccount: '⚠ 尚未登录。\n\n*点击登录。*',
    statusbar_tooltip_unlimited: tooltip('GitHub Copilot 高级配额监控', '无限高级配额'),
    statusbar_tooltip_available: tooltipTable('GitHub Copilot 高级配额监控', '剩余配额：', '交互次数：', '续订：'),
    statusbar_tooltip_available_with_total: tooltipTableWithTotal('GitHub Copilot 高级配额监控', '剩余配额：', '交互次数：', '/', '续订：'),
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — 登录',
    statusbar_widget_unlimited: 'GHCP ∞',

    statusbar_dialog_auth_error_msg: '认证错误：{0}',
    statusbar_dialog_auth_error_title: '认证错误',

    auth_device_code_http_error: 'GitHub 返回了 HTTP {0} 用于 device-code 请求',
    auth_missing_device_code: '响应中缺少 device_code',
    auth_missing_user_code: '响应中缺少 user_code',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: '未知错误',
};

// ── Locale map ────────────────────────────────────────────────────────────────

const BUNDLES: Record<string, Bundle> = {
    de: DE, es: ES, fr: FR, it: IT, ja: JA,
    pt: PT, ru: RU, sq: SQ, tr: TR, zh: ZH,
};

/** Resolves the active bundle from the VS Code display language. */
function activeBundle(): Bundle {
    const lang = (vscode.env.language ?? 'en').toLowerCase();
    // Try exact match first ("zh-cn" → "zh"), then prefix ("pt-br" → "pt")
    if (BUNDLES[lang]) { return BUNDLES[lang]; }
    const prefix = lang.split('-')[0];
    return BUNDLES[prefix] ?? EN;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the localized string for [key], falling back to English when not
 * found in the active bundle.
 */
export function t(key: string): string {
    return activeBundle()[key] ?? EN[key] ?? `[${key}]`;
}

/**
 * Returns the localized string for [key] with {0}, {1}, … placeholders
 * replaced by the supplied [args].
 */
export function tf(key: string, ...args: unknown[]): string {
    let msg = t(key);
    args.forEach((arg, i) => {
        msg = msg.replaceAll(`{${i}}`, String(arg ?? ''));
    });
    return msg;
}

/**
 * Returns the user-facing locale string (e.g. "en", "it", "de") derived from
 * VS Code's display language setting.
 */
export function locale(): string {
    return vscode.env.language ?? 'en';
}

