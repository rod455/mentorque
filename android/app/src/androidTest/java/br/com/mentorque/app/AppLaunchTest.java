package br.com.mentorque.app;

import static org.junit.Assert.assertEquals;

import android.content.Context;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * Fumaça do wrapper: confirma que o pacote instalado é o applicationId que a
 * Google Play espera. O template do Capacitor vinha com "com.getcapacitor.app"
 * cravado aqui — este teste falhava desde sempre.
 */
@RunWith(AndroidJUnit4.class)
public class AppLaunchTest {

    @Test
    public void usesPublishedApplicationId() {
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("mentorque.app", appContext.getPackageName());
    }
}
