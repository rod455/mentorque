package br.com.mentorque.app;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;
import androidx.annotation.RequiresApi;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // A splash nativa do Android 12+ é desenhada pelo sistema a partir do
        // tema de lançamento. Esta chamada faz o mesmo visual valer também no
        // Android 6–11 (compat do core-splashscreen) e precisa vir ANTES do
        // super, que é onde o Capacitor troca o tema da activity.
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // QUANDO O RENDERIZADOR DA WEBVIEW MORRE, O APP NÃO PODE MORRER JUNTO.
        //
        // O app inteiro é uma WebView, e a WebView desenha num PROCESSO
        // SEPARADO do processo do app. Quando o Android mata esse processo (por
        // memória apertada, ou por um defeito do próprio WebView do aparelho), o
        // comportamento PADRÃO é o sistema derrubar a activity: para a pessoa,
        // o app simplesmente fecha sozinho, sem aviso e sem erro. Nada disso
        // chega ao coletor de erros, porque o JavaScript morreu junto com quem
        // ia relatar, e nem sempre chega aos Android vitals, porque não é uma
        // exceção do processo do app.
        //
        // Devolver `true` aqui diz ao sistema "eu cuido disso". A WebView morta
        // é insalvável, então o caminho é soltá-la e refazer a tela: a pessoa vê
        // o app recarregar do começo, o que é ruim, mas é muito melhor do que
        // ver o app desaparecer. E como a abertura seguinte lê a migalha do
        // último passo (lib/app/ultimoPasso.ts), a queda vira uma linha em
        // app_erros dizendo em cima de QUAL passo ela aconteceu.
        //
        // Escrito em 02/09/2026, depois do relato de app fechando ao responder
        // o quiz no Android. Ele não conserta a causa, e não é para isso que
        // está aqui: ele impede que a causa continue invisível.
        final Bridge bridge = getBridge();
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            @RequiresApi(api = Build.VERSION_CODES.O)
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Log.e("Mentorque", "renderizador da WebView morreu; recriando a tela");
                ViewGroup pai = (ViewGroup) view.getParent();
                if (pai != null) {
                    pai.removeView(view);
                }
                view.destroy();
                recreate();
                return true;
            }
        });
    }
}
