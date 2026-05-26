/*
 * anc_c_bridge.h
 * Public interface for the ANC C/C++ low-level bridge
 */

#ifndef ANC_C_BRIDGE_H
#define ANC_C_BRIDGE_H

#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/* System Introspection */
long anc_get_pid(void);
long anc_get_tid(void);
int anc_read_proc_status(char *buffer, size_t size);

/* Memory */
void* anc_mmap_anon(size_t size);
int anc_munmap(void *addr, size_t size);

/* Process Control */
int anc_kill(pid_t pid, int sig);
long anc_ptrace_attach(pid_t pid);

/* Shared Memory */
int anc_shm_create(const char *name, size_t size);
void* anc_shm_map(int fd, size_t size);

/* High-Performance Vector Operations (neural primitives) */
void anc_vector_add_f32(float *a, float *b, float *out, size_t n);
void anc_vector_dot_f32(float *a, float *b, float *result, size_t n);

/* Error */
const char* anc_strerror(int err);

#ifdef __cplusplus
}
#endif

#endif // ANC_C_BRIDGE_H
