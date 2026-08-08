package br.com.mentorque.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // A splash nativa do Android 12+ é desenhada pelo sistema a partir do
        // tema de lançamento. Esta chamada faz o mesmo visual valer também no
        // Android 6–11 (compat do core-splashscreen) e precisa vir ANTES do
        // super, que é onde o Capacitor troca o tema da activity.
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
